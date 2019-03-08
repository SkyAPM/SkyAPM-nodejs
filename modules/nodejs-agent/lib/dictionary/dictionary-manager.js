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

const NetworkAddressDictionary = require("./network-address-dictionary");
const EndpointDictionary = require("./endpoint-dictionary");

/**
 * @param {serviceManager} serviceManager
 *
 * @author zhang xin
 */
function DictionaryManager(serviceManager) {
    this._networkAddressDictionary = new NetworkAddressDictionary(serviceManager);
    this._endpointDictionary = new EndpointDictionary(serviceManager);
}

DictionaryManager.prototype.findNetworkAddress = function(
    networkAddress, callback) {
    return this._networkAddressDictionary.find.apply(
        this._networkAddressDictionary, arguments);
};


DictionaryManager.prototype.findOperationName = function(
    endpoint, callback) {
    return this._endpointDictionary.find.apply(this._endpointDictionary,
        arguments);
};

DictionaryManager.prototype.launch = function() {
    this._networkAddressDictionary.startRegisterNetworkTask();
    this._endpointDictionary.startRegisterEndPoint();
};

module.exports = exports = new DictionaryManager();
