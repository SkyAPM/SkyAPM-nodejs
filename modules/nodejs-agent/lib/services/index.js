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

const RegisterService = require("./register-service");
const TraceService = require("./trace-send-service");
const RemoteClientService = require("./remote-client-service");
const serviceManager = require("../dictionary/dictionary-manager");

/**
 *
 * @constructor
 * @author zhang xin
 */
function ServiceManager() {
}

ServiceManager.prototype.launch = function() {
    this._traceService = new TraceService(this);
    this._remoteClient = new RemoteClientService();
    this._registerService = new RegisterService(this);
    this._dictionaryManagerService = serviceManager;

    this._remoteClient.launch();
    this._registerService.launch();
    this._traceService.launch();
    this._dictionaryManagerService.launch();
};

ServiceManager.prototype.registerService = function() {
    return this._registerService;
};

ServiceManager.prototype.traceService = function() {
    return this._traceService;
};

ServiceManager.prototype.remoteClientService = function() {
    return this._remoteClient;
};

ServiceManager.prototype.dictionaryManagerService = function() {
    return this._dictionaryManagerService;
};

module.exports = new ServiceManager();
