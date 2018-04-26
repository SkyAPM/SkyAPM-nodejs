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

module.exports = TraceSegmentRef;

/**
 *
 * @param {contextCarrier} contextCarrier
 * @constructor
 * @author zhang xin
 */
function TraceSegmentRef(contextCarrier) {
  this.type = "CROSS_PROCESS";
  this._traceSegmentId = contextCarrier.getTraceSegmentId();
  this._spanId = contextCarrier.getSpanId();

  this._entryApplicationInstanceId = contextCarrier.getEntryApplicationInstanceId();
  this._parentApplicationInstanceId = contextCarrier.getParentApplicationInstanceId();

  contextCarrier.fetchPeerHostInfo(function(peerHost) {
    this._peerHost = peerHost;
  }, function(peerId) {
    this._peerId = peerId;
  });

  contextCarrier.fetchEntryOperationNameInfo(function(operationName) {
    this._entryOperationName = operationName;
  }, function(operationId) {
    this._entryOperationId = operationId;
  });

  contextCarrier.fetchParentOperationNameInfo(function(parentOperationName) {
    this._parentOperationName = parentOperationName;
  }, function(parentOperationId) {
    this._parentOperationId = parentOperationId;
  });
}

TraceSegmentRef.prototype.getTraceSegmentId = function() {
  return this._traceSegmentId;
};

TraceSegmentRef.prototype.fetchEntryOperationNameInfo = function(
    registerCallback, unregisterCallback) {
  if (this._entryOperationName) {
    return unregisterCallback(this._entryOperationName);
  } else {
    return registerCallback(this._entryOperationId());
  }
  return this._entryOperationName;
};


TraceSegmentRef.prototype.getEntryApplicationInstanceId = function() {
  return this._entryApplicationInstanceId;
};
