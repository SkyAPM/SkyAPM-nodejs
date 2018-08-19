/*
 * Licensed to the OpenSkywalking under one or more
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

module.exports = AppAndInstanceDiscoveryService;

const os = require("os");
const grpc = require("grpc");
const uuid = require("uuid/v4");
const process = require("process");
const logger = require("../logger");
const AgentConfig = require("../config");
const DiscoveryService = require("../network/DiscoveryService_grpc_pb");
const DiscoveryServiceParameters = require("../network/DiscoveryService_pb");
const ApplicationRegisterService = require("../network/ApplicationRegisterService_grpc_pb");
const ApplicationRegisterServiceParameters = require("../network/ApplicationRegisterService_pb");

/**
 * @param {directServers} directServers
 * @constructor
 * @author zhang xin
 */
function AppAndInstanceDiscoveryService(directServers) {
  this._directServers = directServers;
  this._processUUID = uuid();
  this._applicationRegisterServiceStub = new ApplicationRegisterService.ApplicationRegisterServiceClient(
      this._directServers,
      grpc.credentials.createInsecure());
  this._instanceDiscoveryServiceStub = new DiscoveryService.InstanceDiscoveryServiceClient(this._directServers,
      grpc.credentials.createInsecure());
}

AppAndInstanceDiscoveryService.prototype.registryApplication = function(callback) {
  if (AgentConfig.getApplicationId() && AgentConfig.getApplicationInstanceId()) {
    return;
  }

  let applicationParameter = new ApplicationRegisterServiceParameters.Application();
  applicationParameter.setApplicationcode(AgentConfig.getApplicationCode());
  let that = this;
  this._applicationRegisterServiceStub.applicationCodeRegister(applicationParameter, function(err, response) {
    if (err) {
      logger.error("application-register-service", "failed to register application code. error message: %s",
          err.message);
      return;
    }

    if (response && response.hasApplication()) {
      that.instanceDiscovery(response.getApplication().getValue(), callback);
    }
  });
};


AppAndInstanceDiscoveryService.prototype.instanceDiscovery = function(applicationId, callback) {
  let instanceParameter = new DiscoveryServiceParameters.ApplicationInstance();
  instanceParameter.setApplicationid(applicationId);
  instanceParameter.setOsinfo(buildOsInfo());
  instanceParameter.setRegistertime(new Date().getTime());
  instanceParameter.setAgentuuid(this._processUUID);

  this._instanceDiscoveryServiceStub.registerInstance(instanceParameter, function(err, response) {
    if (err) {
      logger.error("instance-discovery-service", "failed to register application[%s] instance. error message: %s",
          AgentConfig.getApplicationCode(), err.message);
      return;
    }

    if (response && response.getApplicationinstanceid() != 0) {
      logger.info("application-service-register", "application[%s] has been registered.",
          AgentConfig.getApplicationCode());
      callback(applicationId, response.getApplicationinstanceid());
    }
  });

  /**
   * @return {DiscoveryServiceParameters.OSInfo}
   */
  function buildOsInfo() {
    let osInfoParameter = new DiscoveryServiceParameters.OSInfo();
    osInfoParameter.setOsname(os.platform());
    osInfoParameter.setHostname(os.hostname());
    osInfoParameter.setProcessno(process.pid);
    osInfoParameter.setIpv4sList(getAllIPv4Address());
    return osInfoParameter;
  }

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
};


