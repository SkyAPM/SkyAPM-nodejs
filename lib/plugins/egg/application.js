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

const activeContext = require("../constants").ACTIVE_CONTEXT;

module.exports = function(applicationModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(applicationModule.prototype, "createContext", wrapCreateContext);

    /**
     *
     * @param {origin} origin
     * @return {Function}
     */
    function wrapCreateContext(origin) {
        return function(req, res) {
            let ctx = origin.apply(this, arguments);
            ctx[activeContext] = contextManager.activeTraceContext();
            return ctx;
        };
    }

    return applicationModule;
};
