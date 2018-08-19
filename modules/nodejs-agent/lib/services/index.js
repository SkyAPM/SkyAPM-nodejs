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

module.exports = ServiceManager;

const AgentConfig = require("../config");
const traceSegmentCache = require("../cache");
const ApplicationRegisterService = require("./application-register-service");
const TraceSegmentSendService = require("./trace-segment-send-service");

/**
 *
 * @constructor
 * @author zhang xin
 */
function ServiceManager() {
  let directServers = AgentConfig.getDirectServices();
  this._applicationRegisterService = new ApplicationRegisterService(directServers);
  this._traceSegmentSendService = new TraceSegmentSendService(directServers);
}

ServiceManager.prototype.launch = function() {
  let applicationRegisterService = this._applicationRegisterService;
  let timer = setInterval(function() {
    applicationRegisterService.registryApplication.apply(applicationRegisterService, [
      function(applicationId, applicationInstanceId) {
        AgentConfig.setApplicationId(applicationId);
        AgentConfig.setApplicationInstanceId(applicationInstanceId);
        timer.unref();
      }]);
  }, 1000);

  let traceSegmentSendService = this._traceSegmentSendService;
  traceSegmentCache.registerConsumer(function(segmentData) {
    traceSegmentSendService.sendTraceSegment.apply(traceSegmentSendService, arguments);
  });
};
