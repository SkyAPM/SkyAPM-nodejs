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

module.exports = ContextCarrier;

const Base64 = require("js-base64").Base64;
const SW_HEADER_KEY = "sw6";

/**
 * @author zhang xin
 */
function ContextCarrier() {
}

ContextCarrier.prototype.serialize = function() {
    let traceContextArray = [];
    traceContextArray.push("1");
    traceContextArray.push(Base64.encode(this._primaryDistributedTraceId));
    traceContextArray.push(Base64.encode(this._traceSegmentId));
    traceContextArray.push(this._spanId);
    traceContextArray.push(this._parentServiceInstanceId);
    traceContextArray.push(this._entryServiceInstanceId);
    traceContextArray.push(Base64.encode(this._peerHost));
    traceContextArray.push(Base64.encode(this._entryEndpointName));
    traceContextArray.push(Base64.encode(this._parentEndpointName));
    return traceContextArray.join("-");
};

ContextCarrier.prototype.deserialize = function(traceContext) {
    if (!traceContext) {
        return this;
    }

    let traceContextSegment = traceContext.split("-");
    if (traceContextSegment.length != 9) {
        return this;
    }

    this._primaryDistributedTraceId = Base64.decode(traceContextSegment[1]);
    this._traceSegmentId = Base64.decode(traceContextSegment[2]);
    this._spanId = traceContextSegment[3];
    this._parentServiceInstanceId = traceContextSegment[4];
    this._entryServiceInstanceId = traceContextSegment[5];
    this._peerHost = Base64.decode(traceContextSegment[6]);
    this._entryEndpointName = Base64.decode(traceContextSegment[7]);
    this._parentEndpointName = Base64.decode(traceContextSegment[8]);
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
    this._parentServiceInstanceId = parentApplicationInstanceId;
};

ContextCarrier.prototype.getParentApplicationInstanceId = function() {
    return this._parentServiceInstanceId;
};

ContextCarrier.prototype.setEntryApplicationInstanceId = function(entryApplicationInstanceId) {
    this._entryServiceInstanceId = entryApplicationInstanceId;
};

ContextCarrier.prototype.getEntryApplicationInstanceId = function() {
    return this._entryServiceInstanceId;
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
    this._entryEndpointName = "#" + entryOperationName;
};

ContextCarrier.prototype.fetchEntryOperationNameInfo = function(
    registerCallback, unRegisterCallback) {
    if (this._entryEndpointName[0] == "#") {
        return unRegisterCallback(this._entryEndpointName.substr(1));
    } else {
        return registerCallback(this._entryEndpointName);
    }
};

ContextCarrier.prototype.setEntryOperationId = function(entryOperationId) {
    this._entryEndpointName = entryOperationId;
};

ContextCarrier.prototype.setParentOperationName = function(parentOperationName) {
    this._parentEndpointName = "#" + parentOperationName;
};

ContextCarrier.prototype.fetchParentOperationNameInfo = function(
    registerCallback, unRegisterCallback) {
    if (this._parentEndpointName[0] == "#") {
        return unRegisterCallback(this._parentEndpointName.substr(1));
    } else {
        return registerCallback(this._parentEndpointName);
    }
};

ContextCarrier.prototype.setParentOperationId = function(parentOperationId) {
    this._parentEndpointName = parentOperationId;
};

ContextCarrier.prototype.setPrimaryDistributedTraceId = function(primaryDistributedTraceId) {
    this._primaryDistributedTraceId = primaryDistributedTraceId;
};

ContextCarrier.prototype.getPrimaryDistributedTraceId = function() {
    return this._primaryDistributedTraceId;
};

ContextCarrier.prototype.isInvalidate = function() {
    return isEmpty(this._traceSegmentId) || isIllegalSegmentId(this._traceSegmentId) || isEmpty(this._spanId) ||
        isEmpty(this._parentServiceInstanceId)
        || isEmpty(this._entryServiceInstanceId) || isEmpty(this._peerHost) ||
        isEmpty(this._entryEndpointName)
        || isEmpty(this._parentEndpointName) ||
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
