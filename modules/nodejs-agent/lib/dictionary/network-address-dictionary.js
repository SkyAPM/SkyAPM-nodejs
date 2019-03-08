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

module.exports = NetworkAddressDictionary;
const async = require("async");
const logger = require("../logger");


/**
 * @param {serviceManager} serviceManager
 *
 * @author zhang xin
 */
function NetworkAddressDictionary() {
    this._registerNetworkAddresses = new Map();
    this._unregisterNetworkAddress = new Map();
}

NetworkAddressDictionary.prototype.find = function(networkAddress, callback) {
    if (!this._registerNetworkAddresses.get(networkAddress)) {
        this._unregisterNetworkAddress.set(networkAddress, undefined);
        return callback("peerHost", networkAddress);
    }
    return callback("peerId", this._registerNetworkAddresses.get(networkAddress));
};

NetworkAddressDictionary.prototype.startRegisterNetworkTask = function() {
    let that = this;
    async.forever(function(next) {
        setTimeout(function() {
            if (that._unregisterNetworkAddress.size > 0) {
                const serviceManager = require("../services");
                serviceManager.remoteClientService().registerNetwork(that._unregisterNetworkAddress.keys(), function(networkMapping) {
                    for (let mapping of networkMapping.entries()) {
                        if (that._unregisterNetworkAddress.delete(mapping[0])) {
                            logger.debug("network-address-dictionary", "register network address [%s, %s].", mapping[0], mapping[1]);
                            that._registerNetworkAddresses.set(mapping[0], mapping[1]);
                        } else {
                            logger.warn("network-address-dictionary", "Cannot find the %s in unregisterNetworkAddress list.", mapping[0]);
                        }
                    }
                });
            }
            next();
        }, 5 * 1000);
    }, function(err) {
        logger.error("network-address-dictionary", "Failed to execute register network task. Reason: %s", err.message);
    });
};
