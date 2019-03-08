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

module.exports = EndpointKey;

const configAgent = require("../config");

/**
 *
 * @param {endpointName} endpointName
 * @param {isEntry} isEntry
 * @param {isExit} isExit
 * @constructor
 * @author Zhang Xin
 */
function EndpointKey(endpointName, isEntry, isExit) {
    this._serviceId = configAgent.getServiceId();
    this._endpointName = endpointName;
    this._isEntry = isEntry;
    this._isExit = isExit;
}

EndpointKey.prototype.serviceId = function() {
    return this._serviceId;
};

EndpointKey.prototype.endpointName = function() {
    return this._endpointName;
};

EndpointKey.prototype.isEntry = function() {
    return this._isEntry;
};

EndpointKey.prototype.isExit = function() {
    return this._isExit;
};
