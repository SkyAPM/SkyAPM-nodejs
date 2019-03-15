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
            let _serviceId = undefined;
            async.whilst(
                function() {
                    return _serviceId == undefined;
                },
                function(callback) {
                    that._serviceManager.remoteClientService().registerService(agentConfig.getServiceName(), function(serviceId) {
                        logger.info("RegisterService", "Service[%s, %d] had register successfully.", agentConfig.getServiceName(), serviceId);
                        _serviceId = serviceId;
                        successCallback(null, serviceId);
                    }, callback);
                }
            );
        },
        function registerInstance(serviceId, successCallback) {
            let _instanceId = undefined;
            async.whilst(
                function() {
                    return _instanceId == undefined;
                },
                function(callback) {
                    that._serviceManager.remoteClientService().registerInstance(serviceId, {
                        osInfo: {
                            os_name: os.platform(),
                            host_name: os.hostname(),
                            process_no: process.pid + "",
                            language: "nodejs",
                            ipV4s: getAllIPv4Address(),
                        },
                        instanceUUID: function() {
                            return agentConfig.instanceUUID();
                        },
                    }, function(instanceId) {
                        logger.info("RegisterService", "Instance[%s, %d] had register successfully.", agentConfig.getServiceName(), instanceId);
                        _instanceId = instanceId;
                        successCallback(null, serviceId, instanceId);
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
        function changeConfiguration(serviceId, instanceId, callback) {
            agentConfig.setServiceId(serviceId);
            agentConfig.setInstanceId(instanceId);
            callback(null, serviceId, instanceId);
        },
        function sendHeartBeat(serviceId, instanceID, callback) {
            async.forever(function(next) {
                setTimeout(function() {
                    logger.info("RegisterService", "The Service[%s, %d] send heart beat to Collector.", agentConfig.getServiceName(), agentConfig.getInstanceId());
                    that._serviceManager.remoteClientService().sendHeartBeat(agentConfig.getInstanceId());
                    next();
                }, 3 * 60 * 1000);
            }, function(err) {
                logger.error("RegisterService", "Failed to send heart beat of service %s. Reason: %s", agentConfig.getServiceName(), err.message);
            });

            callback(null, serviceId, instanceID);
        },
    ], function(err, result) {
        if (err) {
            logger.error("RegisterService", "The service %s registed failed. Reason: %s", agentConfig.getServiceName(), err.message);
        } else {
            logger.info("RegisterService", "The service %s has registered.");
        }
    });
};
