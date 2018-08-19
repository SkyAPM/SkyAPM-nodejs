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
    instrumentation.enhanceMethod(originModule, "createConnection",
        wrapCreateConnection);

    instrumentation.enhanceMethod(originModule, "createPool", wrapCreatePool);
    instrumentation.enhanceMethod(originModule, "createPoolCluster", wrapCreatePoolCluster);

    /**
     * @this OriginObject
     * @param {original} original
     * @return {function(): *}
     */
    function wrapCreateConnection(original) {
        return function() {
            let connection = original.apply(this, arguments);
            enhanceQueryMethod(connection, instrumentation, contextManager);
            return connection;
        };
    }

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapCreatePool(origin) {
        return function createPool() {
            let pool = origin.apply(this, arguments);
            instrumentation.enhanceMethod(pool.property, "createPool", wrapGetConnection);
            return pool;
        };
    }

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapGetConnection(origin) {
        return function getConnection() {
            let callBack = arguments[0];
            if (typeof callBack === "function") {
                arguments[0] = function(err, connection) {
                    if (connection) enhanceQueryMethod(connection, instrumentation, contextManager);
                    return callBack.apply(this, arguments);
                };
            }
            return origin.apply(this, arguments);
        };
    }

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapCreatePoolCluster(origin) {
        return function wrappedCreatePoolCluster() {
            let cluster = origin.apply(this, arguments);

            instrumentation.enhanceMethod(cluster, "of", function wrapOf(original) {
                return function wrappedOf() {
                    let ofCluster = original.apply(this, arguments);

                    instrumentation.enhanceMethod(ofCluster, "getConnection", wrapGetConnection);

                    return ofCluster;
                };
            });

            return cluster;
        };
    }


    return originModule;
};

/**
 * @param {obj} obj
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {wrappedMethod}
 */
function enhanceQueryMethod(obj, instrumentation, contextManager) {
    let connection = obj;
    return instrumentation.enhanceMethod(obj, "query", queryInterceptor);

    /**
     *
     * @param {original} original
     * @return {function(*=, *=, *=): *}
     */
    function queryInterceptor(original) {
        return function(sql, values, cb) {
            let span = contextManager.createExitSpan("Mysql/query", connection.config.host +
                ":" + connection.config.port);
            span.component(componentDefine.Components.MYSQL);
            span.spanLayer(spanLayer.Layers.DB);
            Tags.DB_TYPE.tag(span, "sql");
            Tags.DB_INSTANCE.tag(span, connection.config.database);
            Tags.DB_STATEMENT.tag(span, sql);
            let enhancedValues = values;
            let enhanceCallback = cb;
            let hasCallback = false;

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

            const result = original.apply(this, [sql, enhancedValues, enhanceCallback]);
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
}
