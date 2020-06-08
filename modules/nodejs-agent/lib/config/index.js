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

/**
 *
 * @constructor
 * @author zhang xin
 */
function AgentConfig() {
    this._serviceName = undefined;
    this._instanceName = undefined;
    this._directServices = undefined;
    this._authentication = undefined;
};

AgentConfig.prototype.getInstanceName = function() {
    return this._instanceName;
};

AgentConfig.prototype.getServiceName = function() {
    return this._serviceName;
};

AgentConfig.prototype.getDirectServices = function() {
    return this._directServices;
};

AgentConfig.prototype.setDirectServices = function(directServices) {
    this._directServices = directServices;
};


AgentConfig.prototype.initConfig = function(agentOptions) {
    this._serviceName = process.env.SW_SERVICE_NAME || (agentOptions && agentOptions.serviceName) || "Your Application";
    this._instanceName = process.env.SW_INSTANCE_NAME || (agentOptions && agentOptions.instanceName) || "Your Instance";
    this._directServices = process.env.SW_DIRECT_SERVERS || (agentOptions && agentOptions.directServers) || "localhost:11800";
    this._authentication = process.env.SW_AUTHENTICATION || (agentOptions && agentOptions.authentication) || "";
};


AgentConfig.prototype.getAuthentication = function() {
    return this._authentication;
};

AgentConfig.prototype.setAuthentication = function(authentication) {
    this._authentication = authentication;
};

module.exports = exports = new AgentConfig();
