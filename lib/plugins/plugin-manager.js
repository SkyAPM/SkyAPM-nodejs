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

module.exports = PluginManager;
const debug = require("debug")("skywalking-plugin-manager");
const OFFICER_SUPPORTED_MODULE = ["mysql", "http"];

/**
 *
 * @param {customPlugin} customPlugin
 * @constructor
 * @author zhang xin
 */
function PluginManager(customPlugin) {
  this._enhanceModule = OFFICER_SUPPORTED_MODULE;
}

PluginManager.prototype.findPlugin = function(name, version) {
  return require("./supported/" + name);
};

PluginManager.prototype.allEnhanceModules = function() {
  debug("loaded enhance modules: %s", this._enhanceModule);
  return this._enhanceModule;
};
