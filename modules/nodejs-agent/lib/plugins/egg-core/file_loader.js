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

/**
 *
 * @param {fileLoaderModule} fileLoaderModule
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 * @author zhang xin
 */

const loadProperty = require("./constants").PROPERTY_FIELD;
const activeContext = require("../constants").ACTIVE_CONTEXT;
const functionArguments = require("function-arguments");
const layerDefine = require("../../trace/span-layer");
const componentDefine = require("../../trace/component-define");

module.exports = function(fileLoaderModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(fileLoaderModule.prototype, "parse", wrapParse);

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapParse(origin) {
        return function() {
            const ret = origin.apply(this, arguments);

            if (this.options[loadProperty] == "controller") {
                ret.forEach(function(item) {
                    let exportsMethods = Object.keys(item.exports);
                    exportsMethods.forEach(function(methodName) {
                        instrumentation.enhanceMethod(item.exports, methodName,
                            wrapControllerMethod);
                    });
                });
            }

            if (this.options[loadProperty] == "service") {
                ret.forEach(function(item) {
                    let exportsMethods = Object.getOwnPropertyNames(item.exports.prototype);
                    exportsMethods.forEach(function(methodName) {
                        if (methodName == "constructor") {
                            return;
                        }
                        instrumentation.enhanceMethod(item.exports, methodName, wrapServiceMethod);
                    });
                });
            }

            return ret;
        };
    }

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapControllerMethod(origin) {
        return function(...args) {
            let ret = undefined;
            let runningSpan = this.request.ctx[activeContext].span();
            try {
                let requestURL = this.request.ctx._matchedRoute;
                contextManager.rewriteSpanInfo(runningSpan, {
                    "operationName": requestURL,
                    "component": componentDefine.Components.EGG,
                    "spanLayer": layerDefine.Layers.HTTP,
                });
                ret = origin.apply(this, arguments);
            } catch (e) {
                runningSpan.errorOccurred();
                runningSpan.log(e);
                throw e;
            }

            return ret;
        };
    }

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapServiceMethod(origin) {
        const methodName = origin.name + "(" + functionArguments(origin) + ")";
        if (origin && origin[Symbol.toStringTag] === "AsyncFunction") {
            return function() {
                let previousActiveContext = contextManager.activeTraceContext();
                let curActiveContext = this.ctx[activeContext];
                contextManager.active(curActiveContext);
                let runningSpan = contextManager.createLocalSpan(this.constructor.name + "." + methodName);
                let ret = undefined;
                try {
                    ret = origin.apply(this, arguments);
                    Promise.all([ret]).then(function() {
                        contextManager.finishSpan(runningSpan);
                        contextManager.active(previousActiveContext);
                    }).catch(function(e) {
                        runningSpan.errorOccurred();
                        runningSpan.log(e);
                        contextManager.finishSpan(runningSpan);
                        contextManager.active(previousActiveContext);
                    });
                    return ret;
                } catch (e) {
                    runningSpan.errorOccurred();
                    runningSpan.log(e);
                    throw e;
                }
                return ret;
            };
        } else {
            return function() {
                let runningSpan = contextManager.createLocalSpan(this.constructor.name + "." + methodName);
                let ret = undefined;
                try {
                    ret = origin.apply(this, arguments);
                    return ret;
                } catch (e) {
                    runningSpan.errorOccurred();
                    runningSpan.log(e);
                    throw e;
                } finally {
                    contextManager.finishSpan(runningSpan);
                }
            };
        }
    }

    return fileLoaderModule;
};
