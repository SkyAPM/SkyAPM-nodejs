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

'use strict'

var Instrumentation = require('./instrumentation');
var ContextManager = require('./trace/context-manager');
var PluginManager = require('./plugins/plugin-manager');
var AgentConfig = require('./config')
module.exports = Agent;

/**
 * @author zhang xin
 */
function Agent() {
    this._instrumentation = null;
    this._contextManager = null;
    this._config = null;
}

Agent.prototype.start = function (agentOptions) {
    AgentConfig.initConfig(agentOptions);
    this._contextManager = new ContextManager(this._agentConfig);
    this._instrumentation = new Instrumentation();
    var _pluginManager = new PluginManager();
    var _agent = this;
    require('./require-module-hook')(_pluginManager.allEnhanceModules(), function (originModule, name, version) {
        var plugin = _pluginManager.findPlugin(name, version);

        if (plugin == undefined) {
            return originModule;
        }

        return plugin(originModule, _agent._instrumentation, _agent._contextManager);
    });

}
