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
 * @param {eggLoaderModule} eggLoaderModule
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 * @author zhang xin
 */

const loadProperty = require("./constants").PROPERTY_FIELD;

module.exports = function(eggLoaderModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(eggLoaderModule.prototype, "loadToApp", wrapLoadMethod);
    instrumentation.enhanceMethod(eggLoaderModule.prototype, "loadToContext", wrapLoadMethod);

    /**
     *
     * @param {origin} origin
     * @return {function(): *}
     */
    function wrapLoadMethod(origin) {
        return function(directory, property, opt) {
            if (opt != undefined) {
                opt[loadProperty] = property;
            }
            return origin.apply(this, arguments);
        };
    }

    return eggLoaderModule;
};
