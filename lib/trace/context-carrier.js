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

module.exports = ContextCarrier;

const SW_HEADER_KEY = "sw3";

/**
 * @author zhang xin
 */
function ContextCarrier() {
}

ContextCarrier.prototype.serialize = function() {
  let traceContextArray = [];
  traceContextArray.push(this._traceSegmentId);
  traceContextArray.push(this._spanId);
  traceContextArray.push(this._parentApplicationInstanceId);
  traceContextArray.push(this._entryApplicationInstanceId);
  traceContextArray.push(this._peerHost);
  traceContextArray.push(this._entryOperationName);
  traceContextArray.push(this._parentOperationName);
  traceContextArray.push(this._primaryDistributedTraceId);
  return traceContextArray.join("|");
};

ContextCarrier.prototype.deserialize = function(traceContext) {
  if (!traceContext) {
    return this;
  }

  let traceContextSegment = traceContext.split("|");
  if (traceContextSegment.length != 8) {
    return this;
  }

  this._traceSegmentId = traceContextSegment[0];
  this._spanId = traceContextSegment[1];
  this._parentApplicationInstanceId = traceContextSegment[2];
  this._entryApplicationInstanceId = traceContextSegment[3];
  this._peerHost = traceContextSegment[4];
  this._entryOperationName = traceContextSegment[5];
  this._parentOperationName = traceContextSegment[6];
  this._primaryDistributedTraceId = traceContextSegment[7];
};

ContextCarrier.prototype.setTraceSegmentId = function(traceSegmentId) {
  this._traceSegmentId = traceSegmentId;
};

ContextCarrier.prototype.getTraceSegmentId = function() {
  return this._traceSegmentId;
};

ContextCarrier.prototype.setSpanId = function(spanId) {
  this._spanId = spanId;
};

ContextCarrier.prototype.getSpanId = function() {
  return this._spanId;
};

ContextCarrier.prototype.setParentApplicationInstanceId = function(parentApplicationInstanceId) {
  this._parentApplicationInstanceId = parentApplicationInstanceId;
};

ContextCarrier.prototype.getParentApplicationInstanceId = function() {
  return this._parentApplicationInstanceId;
};

ContextCarrier.prototype.setEntryApplicationInstanceId = function(entryApplicationInstanceId) {
  this._entryApplicationInstanceId = entryApplicationInstanceId;
};

ContextCarrier.prototype.getEntryApplicationInstanceId = function() {
  return this._entryApplicationInstanceId;
};

ContextCarrier.prototype.setPeerHost = function(peerHost) {
  this._peerHost = "#" + peerHost;
};

ContextCarrier.prototype.setPeerId = function(peerId) {
  this._peerHost = peerId;
};

ContextCarrier.prototype.fetchPeerHostInfo = function(
    registerCallback, unRegisterCallback) {
  if (this._peerHost[0] == "#") {
    return unRegisterCallback(this._peerHost.substr(1));
  } else {
    return registerCallback(this._peerHost);
  }
};

ContextCarrier.prototype.setEntryOperationName = function(entryOperationName) {
  this._entryOperationName = "#" + entryOperationName;
};

ContextCarrier.prototype.fetchEntryOperationNameInfo = function(
    registerCallback, unRegisterCallback) {
  if (this._entryOperationName[0] == "#") {
    return unRegisterCallback(this._entryOperationName.substr(1));
  } else {
    return registerCallback(this._entryOperationName);
  }
};

ContextCarrier.prototype.setEntryOperationId = function(entryOperationId) {
  this._entryOperationName = entryOperationId;
};

ContextCarrier.prototype.setParentOperationName = function(parentOperationName) {
  this._parentOperationName = "#" + parentOperationName;
};

ContextCarrier.prototype.fetchParentOperationNameInfo = function(
    registerCallback, unRegisterCallback) {
  if (this._parentOperationName[0] == "#") {
    return unRegisterCallback(this._parentOperationName.substr(1));
  } else {
    return registerCallback(this._parentOperationName);
  }
};

ContextCarrier.prototype.setParentOperationId = function(parentOperationId) {
  this._parentOperationName = parentOperationId;
};

ContextCarrier.prototype.setPrimaryDistributedTraceId = function(primaryDistributedTraceId) {
  this._primaryDistributedTraceId = primaryDistributedTraceId;
};

ContextCarrier.prototype.getPrimaryDistributedTraceId = function() {
  return this._primaryDistributedTraceId;
};

ContextCarrier.prototype.isInvalidate = function() {
  return isEmpty(this._traceSegmentId) || isIllegalSegmentId(this._traceSegmentId) || isEmpty(this._spanId) ||
      isEmpty(this._parentApplicationInstanceId)
      || isEmpty(this._entryApplicationInstanceId) || isEmpty(this._peerHost) ||
      isEmpty(this._entryOperationName)
      || isEmpty(this._parentOperationName) ||
      isEmpty(this._primaryDistributedTraceId);

  /**
   *
   * @param {value} value
   * @return {boolean}
   */
  function isEmpty(value) {
    return value == "" || value == undefined;
  }

  /**
   * @param {traceSegmentId} traceSegmentId
   * @return {boolean}
   */
  function isIllegalSegmentId(traceSegmentId) {
    return traceSegmentId.split(".").length != 3;
  }
};

ContextCarrier.prototype.fetchBy = function(callback) {
  let value = callback(SW_HEADER_KEY);
  this.deserialize(value);
};

ContextCarrier.prototype.pushBy = function(callback) {
  let serializedTracingContext = this.serialize();
  return callback(SW_HEADER_KEY, serializedTracingContext);
};
