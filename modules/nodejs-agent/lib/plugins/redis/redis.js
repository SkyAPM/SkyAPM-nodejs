/*
 * Licensed to the SkyAPM under one or more
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

const spanLayer = require("../../trace/span-layer");
const componentDefine = require("../../trace/component-define");
const Tags = require("../../trace/tags");

/**
 * @param {originModule} originModule
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 * @author huang qicong
 */
module.exports = function(originModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(originModule, "createClient", wrapCreateClient);

    /**
     * @this OriginObject
     * @param {original} original
     * @return {function(): *}
     */
    function wrapCreateClient(original) {
        return function() {
            let client = original.apply(this, arguments);
            enhanceCommandsMethod(client, instrumentation, contextManager);
            return client;
        };
    }

    return originModule;
};

/**
 * @param {obj} obj
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 */
function enhanceCommandsMethod(obj, instrumentation, contextManager) {
    let connection = obj;
    instrumentation.enhanceMethod(obj, "internal_send_command", commandInterceptor);

    /**
     *
     * @param {original} original
     * @return {function(*=, *=, *=): *}
     */
    function commandInterceptor(original) {
        // eslint-disable-next-line camelcase
        return function(command_obj) {
            let span = contextManager.createExitSpan("Redis/" + command_obj.command, connection.address);
            span.component(componentDefine.Components.REDIS);
            span.spanLayer(spanLayer.Layers.CACHE);
            Tags.DB_TYPE.tag(span, "Redis");
            Tags.DB_INSTANCE.tag(span, connection.selected_db);
            Tags.DB_STATEMENT.tag(span, command_obj.command + " args: " + command_obj.args.toString());
            // eslint-disable-next-line camelcase
            const result = original.apply(this, [command_obj]);
            let callback = command_obj.callback;
            if (typeof command_obj.callback === "function") {
                command_obj.callback = instrumentation.enhanceCallback(span.traceContext(), contextManager, function() {
                    contextManager.finishSpan(span);
                    return callback.apply(this, arguments);
                });
            } else {
                command_obj.callback = instrumentation.enhanceCallback(span.traceContext(), contextManager, function() {
                    contextManager.finishSpan(span);
                });
            }
            return result;
        };
    }
}
