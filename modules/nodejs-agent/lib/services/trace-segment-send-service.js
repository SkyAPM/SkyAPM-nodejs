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

module.exports = TraceSegmentSender;

const grpc = require("grpc");
const async = require("async");
const logger = require("../logger");
const TraceSegmentService = require("../network/TraceSegmentService_grpc_pb");

/**
 * @param {directServers} directServers
 * @constructor
 * @author zhang xin
 */
function TraceSegmentSender(directServers) {
  this._directServers = directServers;
  this._traceSegmentServiceStub = new TraceSegmentService.TraceSegmentServiceClient(this._directServers,
      grpc.credentials.createInsecure());
}

TraceSegmentSender.prototype.sendTraceSegment = function(traceSegments) {
  let call = this._traceSegmentServiceStub.collect(function(error, stat) {
    if (error) {
      return;
    }
  });

  /**
   * @param {traceSegment} traceSegment
   * @return {Function}
   */
  function traceSegmentSender(traceSegment) {
    return function() {
      call.write(traceSegment.transform());
    };
  }

  let traceSegmentSenders = [];
  for (let i = 0; i < traceSegments.length; i++) {
    traceSegmentSenders[i] = traceSegmentSender(traceSegments[i]);
  }

  async.parallelLimit(traceSegmentSenders, 5, function(err, result) {
    if (err) {
      logger.warn("trace-segment-send", "failed to send trace segment data.");
    }
    call.end();
  });
};

