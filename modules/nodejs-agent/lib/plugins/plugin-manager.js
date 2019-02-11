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

module.exports = PluginManager;
const logger = require("../logger");
const OFFICER_SUPPORTED_MODULE = ["mysql", "http", "egg-core", "egg"];

/**
 *
 * @param {customPlugin} customPlugin
 * @constructor
 * @author zhang xin
 */
function PluginManager(customPlugin) {
    this._enhanceModule = OFFICER_SUPPORTED_MODULE;
    const plugins = {};
    this._enhanceModule.forEach(function(enhanceModule) {
        plugins[enhanceModule] = require("./" + enhanceModule);
    });

    this._plugins = plugins;
}

PluginManager.prototype.attemptToFindInterceptor = function(moduleName, version, enhanceFile) {
    if (!this._plugins || !this._plugins[moduleName]) {
        return undefined;
    }

    return this._plugins[moduleName].attemptToFindInterceptor(version, enhanceFile);
};

PluginManager.prototype.allEnhanceModules = function() {
    logger.info("skyapm-plugin-manager", "loaded enhance modules: %s", this._enhanceModule);
    return this._enhanceModule;
};
