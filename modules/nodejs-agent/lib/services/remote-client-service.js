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
const ManagementService = require("../network/management/Management_grpc_pb");
const ManagementServiceParameter = require("../network/management/Management_pb");
const TraceSendService = require("../network/language-agent/Tracing_grpc_pb");
const CommonParameteres = require("../network/common/Common_pb");

/**
 * @constructor
 * @author Zhang Xin
 */
function RemoteClient() {
};

RemoteClient.prototype.connectRemote = function(directServer) {
    this._managemenet = new ManagementService.ManagementServiceClient(directServer, grpc.credentials.createInsecure());
    this._tracerSender = new TraceSendService.TraceSegmentReportServiceClient(directServer, grpc.credentials.createInsecure());
};

RemoteClient.prototype.launch = function() {
    this.initConnection(AgentConfig.getDirectServices());
};

RemoteClient.prototype.sendTraceData = function(traces) {
    let that = this;

    let meta = new grpc.Metadata();
    meta.add("Authentication", AgentConfig.getAuthentication());

    let call = this._tracerSender.collect(meta, function(error, commands) {
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

RemoteClient.prototype.reportInstanceProperties = function(serviceOptions, successCallback, callback) {
    let that = this;

    let instanceProperties = new ManagementServiceParameter.InstanceProperties();
    instanceProperties.setServiceinstance(AgentConfig.getInstanceName());
    instanceProperties.setService(AgentConfig.getInstanceName());
    let osInfoProperties = [];
    Object.keys(serviceOptions.osInfo).forEach(function(value) {
        if (serviceOptions.osInfo[value] instanceof Array) {
            serviceOptions.osInfo[value].forEach(function(arrayValue) {
                let valueParameter = new CommonParameteres.KeyStringValuePair();
                valueParameter.setKey(value);
                valueParameter.setValue(arrayValue);
                osInfoProperties.push(valueParameter);
            });
        } else {
            let valueParameter = new CommonParameteres.KeyStringValuePair();
            valueParameter.setKey(value);
            valueParameter.setValue(serviceOptions.osInfo[value]);
            osInfoProperties.push(valueParameter);
        }
    });
    instanceProperties.setPropertiesList(osInfoProperties);

    let meta = new grpc.Metadata();
    meta.add("Authentication", AgentConfig.getAuthentication());
    this._managemenet.reportInstanceProperties(instanceProperties, meta, function(err, response) {
        if (err) {
            logger.error("remote-client-service", "Failed to register service name %s . error message: %s", AgentConfig.getServiceName(),
                err.message);
            that.dealWithError(err);
        } else {
            successCallback();
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

RemoteClient.prototype.keepAlive = function() {
    let that = this;

    let instancePingPkg = new ManagementServiceParameter.InstancePingPkg();
    instancePingPkg.setService(AgentConfig.getServiceName());
    instancePingPkg.setServiceinstance(AgentConfig.getInstanceName());

    this._managemenet.keepAlive(instancePingPkg, function(err, response) {
        if (err) {
            logger.error("remote-client-service", "Failed to send heart beat of service %s.", AgentConfig.getServiceName());
            that.dealWithError(err);
        }
        // TODO deal with commands
    });
};

RemoteClient.prototype.dealWithError = function(err) {
    if (err.code === 14) {
        let newCollector = this._directServers[(this._nextDirectServersIndex++ % this._directServers.length)];
        logger.info("remote-client-service", "Attempt to connection collector[%s]. because of the previous collector cannot connect.",
            newCollector);
        this.connectRemote(newCollector);
    } else {
        logger.info("remote-client-service", "Unknown error: %s", err);
    }
};

module.exports = exports = RemoteClient;
