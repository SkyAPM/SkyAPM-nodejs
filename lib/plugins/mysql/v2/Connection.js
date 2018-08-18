/*
 * Licensed to the OpenSkywalking under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const spanLayer = require("../../../trace/span-layer");
const componentDefine = require("../../../trace/component-define");
const Tags = require("../../../trace/tags");

/**
 * @param {originModule} originModule
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 * @author zhang xin
 */
module.exports = function(originModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(originModule, "query", wrapQuery);

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapQuery(origin) {
        return function(sql, values, cb) {
            let sqlStr = undefined;
            let hasCallback = false;

            if (typeof sql == "string") {
                sqlStr = sql;
            } else if (typeof sql == "object") {
                if (typeof sql.onResult === "function") {
                    sql.onResult = instrumentation.enhanceCallback(span.traceContext(),
                        contextManager, function() {
                            contextManager.finishSpan(span);
                            return values.apply(this, arguments);
                        });
                    hasCallback = true;
                }
                sqlStr = sql.sql;
            }

            let span = contextManager.createExitSpan("Mysql/query", this.config.host +
                ":" + this.config.port);
            span.component(componentDefine.Components.MYSQL);
            span.spanLayer(spanLayer.Layers.DB);
            Tags.DB_TYPE.tag(span, "sql");
            Tags.DB_INSTANCE.tag(span, this.config.database);
            Tags.DB_STATEMENT.tag(span, sqlStr);

            let enhancedValues = values;
            let enhanceCallback = cb;

            if (typeof values === "function") {
                enhancedValues = instrumentation.enhanceCallback(span.traceContext(),
                    contextManager, function() {
                        contextManager.finishSpan(span);
                        return values.apply(this, arguments);
                    });
                hasCallback = true;
            } else if (typeof cb === "function") {
                enhanceCallback = instrumentation.enhanceCallback(span.traceContext(),
                    contextManager, function() {
                        contextManager.finishSpan(span);
                        return cb.apply(this, arguments);
                    });
                hasCallback = true;
            }

            const result = origin.apply(this, [sql, enhancedValues, enhanceCallback]);

            if (result && !hasCallback) {
                instrumentation.enhanceMethod(result, "emit", function(original) {
                    return function(event) {
                        switch (event) {
                            case "error":
                            case "end":
                                contextManager.finishSpan(span);
                        }
                        return original.apply(this, arguments);
                    };
                });
            }

            return result;
        };
    }

    return originModule;
};
