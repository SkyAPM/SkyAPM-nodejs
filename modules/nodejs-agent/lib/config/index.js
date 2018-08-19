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
const AgentConfig = function() {
    let _applicationCode = undefined;
    let _applicationId = undefined;
    let _applicationInstanceId = undefined;
    let _directServices = undefined;

    this.getApplicationId = function() {
        return _applicationId;
    };
    this.setApplicationId = function(applicationId) {
        _applicationId = applicationId;
    };

    this.getApplicationInstanceId = function() {
        return _applicationInstanceId;
    };

    this.setApplicationInstanceId = function(applicationInstanceId) {
        _applicationInstanceId = applicationInstanceId;
    };

    this.getApplicationCode = function() {
        return _applicationCode;
    };

    this.getDirectServices = function() {
        return _directServices;
    };

    this.setDirectServices = function(directServices) {
        _directServices = directServices;
    };

    this.initConfig = function(agentOptions) {
        if (!agentOptions.hasOwnProperty("applicationCode")) {
            throw new Error("application Code cannot be empty");
        }
        _applicationCode = agentOptions.applicationCode;

        _directServices = "localhost:11800";
        // TODO for now, only support one address
        if (agentOptions.hasOwnProperty("directServers")) {
            _directServices = agentOptions.directServers;
        }
    };

    if (AgentConfig.caller != AgentConfig.getInstance) {
        throw new Error("This object cannot be instanciated");
    }
};

AgentConfig.instance = null;

AgentConfig.getInstance = function() {
    if (this.instance === null) {
        this.instance = new AgentConfig();
    }
    return this.instance;
};

module.exports = AgentConfig.getInstance();
