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
const SW_HEADER_KEY = "sw8";

/**
 * @author zhang xin
 */
function ContextCarrier() {
    this._traceId = undefined;
    this._traceSegmentId = undefined;
    this._spanId = -1;
    this._parentService = undefined;
    this._parentServiceInstance = undefined;
    this._parentEndpoint = undefined;
    this._addressUsedAtClient = undefined;
}

ContextCarrier.prototype.serialize = function() {
    let traceContextArray = [];
    traceContextArray.push("1");
    traceContextArray.push(Base64.encode(this._traceId));
    traceContextArray.push(Base64.encode(this._traceSegmentId));
    traceContextArray.push(this._spanId);
    traceContextArray.push(Base64.encode(this._parentService));
    traceContextArray.push(Base64.encode(this._parentServiceInstance));
    traceContextArray.push(Base64.encode(this._parentEndpoint));
    traceContextArray.push(Base64.encode(this._addressUsedAtClient));
    return traceContextArray.join("-");
};

ContextCarrier.prototype.deserialize = function(traceContext) {
    if (!traceContext) {
        return this;
    }

    let traceContextSegment = traceContext.split("-");
    if (traceContextSegment.length != 8) {
        return this;
    }

    this._traceId = Base64.decode(traceContextSegment[1]);
    this._traceSegmentId = Base64.decode(traceContextSegment[2]);
    this._spanId = traceContextSegment[3];
    this._parentService = Base64.decode(traceContextSegment[4]);
    this._parentServiceInstance = Base64.decode(traceContextSegment[5]);
    this._parentEndpoint = Base64.decode(traceContextSegment[6]);
    this._addressUsedAtClient = Base64.decode(traceContextSegment[7]);
};

ContextCarrier.prototype.setAddressUsedAtClient = function(addressUsedAtClient) {
    this._addressUsedAtClient = addressUsedAtClient;
};

ContextCarrier.prototype.getAddressUsedAtClient = function() {
    return this._addressUsedAtClient;
};

ContextCarrier.prototype.setParentEndpoint = function(parentEndpoint) {
    this._parentEndpoint = parentEndpoint;
};

ContextCarrier.prototype.getParentEndpoint = function() {
    return this._parentEndpoint;
};

ContextCarrier.prototype.setParentServiceInstance = function(parentServiceInstance) {
    this._parentServiceInstance = parentServiceInstance;
};

ContextCarrier.prototype.getParentServiceInstance = function() {
    return this._parentServiceInstance;
};

ContextCarrier.prototype.setParentService = function(parentService) {
    this._parentService = parentService;
};

ContextCarrier.prototype.getParentService = function() {
    return this._parentService;
};

ContextCarrier.prototype.setSpanId = function(spanId) {
    this._spanId = spanId;
};

ContextCarrier.prototype.getSpanId = function() {
    return this._spanId;
};

ContextCarrier.prototype.setTraceSegmentId = function(traceSegmentId) {
    this._traceSegmentId = traceSegmentId;
};

ContextCarrier.prototype.getTraceSegmentId = function() {
    return this._traceSegmentId;
};

ContextCarrier.prototype.setTraceId = function(traceId) {
    this._traceId = traceId;
};

ContextCarrier.prototype.getTraceId = function() {
    return this._traceId;
};

ContextCarrier.prototype.isInvalidate = function() {
    return isEmpty(this._traceId) || isIllegalSegmentId(this._traceSegmentId) || isEmpty(this._spanId) ||
        isEmpty(this._parentService)
        || isEmpty(this._parentServiceInstance) || isEmpty(this._parentEndpoint) ||
        isEmpty(this._addressUsedAtClient);

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
