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

const uuid = require("uuid/v4");

/**
 *
 * @constructor
 * @author zhang xin
 */
function AgentConfig() {
    this._serviceName = undefined;
    this._serviceId = undefined;
    this._instanceId = undefined;
    this._directServices = undefined;
    this._instanceUUID = undefined;
    this._authentication = undefined;
};

AgentConfig.prototype.getServiceId = function() {
    return this._serviceId;
};
AgentConfig.prototype.setServiceId = function(applicationId) {
    this._serviceId = applicationId;
};

AgentConfig.prototype.getInstanceId = function() {
    return this._instanceId;
};

AgentConfig.prototype.setInstanceId = function(applicationInstanceId) {
    this._instanceId = applicationInstanceId;
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


AgentConfig.prototype.instanceUUID = function() {
    return this._instanceUUID;
};

AgentConfig.prototype.initConfig = function(agentOptions) {
    this._serviceName = process.env.SW_SERVICE_NAME || (agentOptions && agentOptions.serviceName) || "You Application";
    this._directServices = process.env.SW_DIRECT_SERVERS || (agentOptions && agentOptions.directServers) || "localhost:11800";
    this._instanceUUID = agentOptions.instanceUUID || uuid();
    this._authentication = agentOptions.authentication || "";
};


AgentConfig.prototype.getAuthentication = function() {
    return this._authentication;
};

AgentConfig.prototype.setAuthentication = function(authentication) {
    this._authentication = authentication;
};

module.exports = exports = new AgentConfig();
