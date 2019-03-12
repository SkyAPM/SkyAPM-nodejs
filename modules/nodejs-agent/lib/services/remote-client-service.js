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

const grpc = require("grpc");
const async = require("async");
const logger = require("../logger");
const AgentConfig = require("../config");
const Endpoint = require("../dictionary/endpoint");
const Register = require("../network/register/Register_grpc_pb");
const CommonParameteres = require("../network/common/common_pb");
const RegisterParameteres = require("../network/register/Register_pb");
const TracerSender = require("../network/language-agent-v2/trace_grpc_pb");
const ServiceInstancePing = require("../network/register/InstancePing_grpc_pb");
const ServiceInstancePingParameteres = require("../network/register/InstancePing_pb");

/**
 * @constructor
 * @author Zhang Xin
 */
function RemoteClient() {
};

RemoteClient.prototype.connectRemote = function(directServer) {
    this._register = new Register.RegisterClient(directServer,
        grpc.credentials.createInsecure());
    this._instancePinger = new ServiceInstancePing.ServiceInstancePingClient(
        directServer,
        grpc.credentials.createInsecure());
    this._tracerSender = new TracerSender.TraceSegmentReportServiceClient(
        directServer,
        grpc.credentials.createInsecure());
};

RemoteClient.prototype.launch = function() {
    this.initConnection(AgentConfig.getDirectServices());
};

RemoteClient.prototype.sendTraceData = function(traces) {
    let that = this;

    let call = this._tracerSender.collect(function(error, commands) {
        if (error) {
            logger.error("remote-client-service", "Failed to register network address. error message: %s", error.message);
            that.dealWithError(error);
            return;
        }
        // TODO deal with commands
    });

    /**
     *
     * @param {trace} trace
     * @return {Function}
     */
    function sendTrace(trace) {
        return function(callback) {
            call.write(trace.transform());
            callback();
        };
    }

    let traceSenders = [];
    for (let i = 0; i < traces.length; i++) {
        traceSenders[i] = sendTrace(traces[i]);
    }

    async.series(traceSenders, function(error, result) {
        call.end();
    });
};

RemoteClient.prototype.registerNetwork = function(networkes, callback) {
    let that = this;

    let networkParameter = new RegisterParameteres.NetAddresses();
    let networkesK = networkes.next();
    while (!networkesK.done) {
        let network = networkesK.value;
        networkParameter.addAddresses(network);
        networkesK = networkes.next();
    }

    this._register.doNetworkAddressRegister(networkParameter,
        function(err, response) {
            if (err) {
                logger.error("remote-client-service",
                    "Failed to register network address. error message: %s",
                    err.message);
                that.dealWithError(err);
            }

            if (response && response.getAddressidsList().length > 0) {
                let networkMapping = new Map();
                response.getAddressidsList().forEach(function(mapping) {
                    networkMapping.set(mapping.getKey(), mapping.getValue());
                });

                callback(networkMapping);
            }
        });
};

RemoteClient.prototype.registerEndpoint = function(endpoints, callback) {
    let that = this;

    let endpointsParameteres = new RegisterParameteres.Enpoints();
    endpoints.forEach(function(endpoint) {
        let endpointParameter = new RegisterParameteres.Endpoint();
        endpointParameter.setServiceid(endpoint.serviceId());
        endpointParameter.setEndpointname(endpoint.endpointName());

        if (endpoint.isEntry()) {
            endpointParameter.setFrom(CommonParameteres.DetectPoint.SERVER);
        }

        if (endpoint.isExit()) {
            endpointParameter.setFrom(CommonParameteres.DetectPoint.CLIENT);
        }

        endpointsParameteres.addEndpoints(endpointParameter);
    });

    this._register.doEndpointRegister(endpointsParameteres,
        function(err, response) {
            if (err) {
                logger.error("remote-client-service",
                    "Failed to register endpoints. error message: %s", err.message);
                that.dealWithError(err);
            }

            if (response && response.getElementsList().length > 0) {
                let endpointMapping = new Map();
                response.getElementsList().forEach(function(mapping) {
                    let isEntry = false;
                    let isExit = false;

                    if (mapping.getFrom() == CommonParameteres.DetectPoint.SERVER) {
                        isEntry = true;
                    }

                    if (mapping.getFrom() == CommonParameteres.DetectPoint.CLIENT) {
                        isExit = true;
                    }

                    endpointMapping.set(new Endpoint(mapping.getEndpointname(), isEntry, isExit), mapping.getEndpointid());
                });

                callback(endpointMapping);
            }
        });
};

RemoteClient.prototype.registerService = function(
    serviceName, successCallback, callback) {
    let that = this;

    let servicesParameter = new RegisterParameteres.Services();
    let serviceParameter = new RegisterParameteres.Service();
    serviceParameter.setServicename(serviceName);
    servicesParameter.addServices(serviceParameter);
    this._register.doServiceRegister(servicesParameter, function(err, response) {
        if (err) {
            logger.error("remote-client-service", "Failed to register service name %s . error message: %s", serviceName,
                err.message);
            that.dealWithError(err);
        }

        if (response && response.getServicesList().length > 0) {
            response.getServicesList().forEach(function(mapping) {
                if (mapping.getKey() == serviceName) {
                    successCallback(mapping.getValue());
                }
            });
        }

        callback();
    });
};

RemoteClient.prototype.registerInstance = function(
    serviceId, opts, successCallback, callback) {
    let that = this;

    let serviceInstancesParameter = new RegisterParameteres.ServiceInstances();
    let serviceInstanceParameter = new RegisterParameteres.ServiceInstance();

    serviceInstanceParameter.setServiceid(serviceId);
    serviceInstanceParameter.setInstanceuuid(opts.instanceUUID());
    serviceInstanceParameter.setTime(new Date().getTime());

    let osInfoProperties = [];
    Object.keys(opts.osInfo).forEach(function(value) {
        if (opts.osInfo[value] instanceof Array) {
            opts.osInfo[value].forEach(function(arrayValue) {
                let valueParameter = new CommonParameteres.KeyStringValuePair();
                valueParameter.setKey(value);
                valueParameter.setValue(arrayValue);
                osInfoProperties.push(valueParameter);
            });
        } else {
            let valueParameter = new CommonParameteres.KeyStringValuePair();
            valueParameter.setKey(value);
            valueParameter.setValue(opts.osInfo[value]);
            osInfoProperties.push(valueParameter);
        }
    });
    serviceInstanceParameter.setPropertiesList(osInfoProperties);
    serviceInstancesParameter.addInstances(serviceInstanceParameter);

    this._register.doServiceInstanceRegister(serviceInstancesParameter,
        function(err, response) {
            if (err) {
                logger.error("remote-client-service", "Failed to register instance of service %s. error message: %s",
                    AgentConfig.getServiceName(), err.message);
                that.dealWithError(err);
            }

            if (response && response.getServiceinstancesList().length > 0) {
                response.getServiceinstancesList().forEach(function(mapping) {
                    if (mapping.getKey() == AgentConfig.instanceUUID()) {
                        successCallback(mapping.getValue());
                    }
                });
            }

            callback();
        });
};

RemoteClient.prototype.initConnection = function(directServers) {
    this._directServers = directServers.split(",");
    this._nextDirectServersIndex = Math.floor((Math.random() * 100)) %
        this._directServers.length;
    this.connectRemote(this._directServers[this._nextDirectServersIndex]);
};

RemoteClient.prototype.sendHeartBeat = function(instanceId) {
    let that = this;

    let instancePingPkg = new ServiceInstancePingParameteres.ServiceInstancePingPkg();
    instancePingPkg.setServiceinstanceid(instanceId);
    instancePingPkg.setTime(new Date().getTime());
    instancePingPkg.setServiceinstanceuuid(AgentConfig.instanceUUID());

    this._instancePinger.doPing(instancePingPkg, function(err, response) {
        if (err) {
            logger.error("remote-client-service", "Failed to send heart beat of service %s.", AgentConfig.getServiceName());
            that.dealWithError(err);
        }
        // TODO deal with commands
    });
};

RemoteClient.prototype.dealWithError = function(err) {
    if (err.code == 14) {
        let newCollector = this._directServers[(this._nextDirectServersIndex++ % this._directServers.length)];
        logger.info("remote-client-service", "Attempt to connection collector[%s]. because of the previous collector cannot connect.",
            newCollector);
        this.connectRemote(newCollector);
    }
};

module.exports = exports = RemoteClient;
