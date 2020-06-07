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

module.exports = RegisterService;
const os = require("os");
const process = require("process");
const logger = require("../logger");
const async = require("async");
const agentConfig = require("../config");

/**
 * @param {serviceManager} serviceManager
 * @constructor
 * @author Zhang Xin
 */
function RegisterService(serviceManager) {
    this._serviceManager = serviceManager;
}

RegisterService.prototype.launch = function() {
    let that = this;
    async.waterfall([
        function registerService(successCallback) {
            let registered = false;
            async.whilst(
                function() {
                    return !registered;
                },
                function(callback) {
                    that._serviceManager.remoteClientService().reportInstanceProperties({
                        osInfo: {
                            os_name: os.platform(),
                            host_name: os.hostname(),
                            process_no: process.pid + "",
                            language: "nodejs",
                            ipv4: getAllIPv4Address(),
                        },
                    }, function() {
                        logger.info("RegisterService", "Service[%s, %d] had register successfully.", agentConfig.getServiceName());
                        registered = true;
                        successCallback(null);
                    }, callback);
                }
            );

            /**
             * @return {Array}
             */
            function getAllIPv4Address() {
                let ipv4Address = [];
                let ifaces = os.networkInterfaces();
                Object.keys(ifaces).forEach(function(ifname) {
                    ifaces[ifname].forEach(function(iface) {
                        if ("IPv4" !== iface.family || iface.internal !== false) {
                            return;
                        }
                        ipv4Address.push(iface.address);
                    });
                });
                return ipv4Address;
            }
        },
        function keepAlive(callback) {
            async.forever(function(next) {
                setTimeout(function() {
                    logger.info("RegisterService", "The Service[%s, %d] send heart beat to Collector.", agentConfig.getServiceName(), agentConfig.getInstanceName());
                    that._serviceManager.remoteClientService().keepAlive();
                    next();
                }, 30 * 1000);
            }, function(err) {
                logger.error("RegisterService", "Failed to send heart beat of service %s. Reason: %s", agentConfig.getServiceName(), err.message);
            });

            callback(null);
        },
    ], function(err, result) {
        if (err) {
            logger.error("RegisterService", "The service %s registered failed. Reason: %s", agentConfig.getServiceName(), err.message);
        } else {
            logger.info("RegisterService", "The service %s has registered.", agentConfig.getServiceName());
        }
    });
};
