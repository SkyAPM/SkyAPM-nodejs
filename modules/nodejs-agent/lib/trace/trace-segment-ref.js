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

module.exports = TraceSegmentRef;

const ID = require("./trace-segment-id");

const TraceSegmentParameteres = require("../network/language-agent/Tracing_pb");

/**
 *
 * @param {contextCarrier} contextCarrier
 * @constructor
 * @author zhang xin
 */
function TraceSegmentRef(contextCarrier) {
    this.type = "CROSS_PROCESS";
    let idSegment = contextCarrier.getTraceSegmentId().split(".");
    this._traceSegmentId = new ID({
        part1: idSegment[0],
        part2: idSegment[1],
        part3: idSegment[2],
    });

    this._spanId = contextCarrier.getSpanId();
    this._parentServiceInstance = contextCarrier.getParentServiceInstance();
    this._parentService = contextCarrier.getParentServiceInstance();
    this._peerHost = contextCarrier.getAddressUsedAtClient();
    this._parentOperationName = contextCarrier.getParentEndpoint();
    let primaryDistributedTraceId = contextCarrier.getTraceId().split(".");
    this._primaryDistributedTraceId = new ID({
        part1: primaryDistributedTraceId[0],
        part2: primaryDistributedTraceId[1],
        part3: primaryDistributedTraceId[2],
    });
}

TraceSegmentRef.prototype.getPrimaryDistributedTraceId = function() {
    return this._primaryDistributedTraceId;
};

TraceSegmentRef.prototype.transform = function() {
    let serializedTraceSegmentRef = new TraceSegmentParameteres.SegmentReference();
    serializedTraceSegmentRef.setReftype(TraceSegmentParameteres.RefType.CROSSPROCESS);

    /**
     * @param {traceSegmentId} traceSegmentId
     * @return {TraceSegmentServiceParameters.UniqueId}
     */
    function buildUniqueId(traceSegmentId) {
        return traceSegmentId.part1() + "." + traceSegmentId.part2() + "." + traceSegmentId.part3();
    }

    serializedTraceSegmentRef.setTraceid(buildUniqueId(this._primaryDistributedTraceId));
    serializedTraceSegmentRef.setParenttracesegmentid(buildUniqueId(this._traceSegmentId));
    serializedTraceSegmentRef.setParentspanid(this._spanId);
    serializedTraceSegmentRef.setParentservice(this._parentService);
    serializedTraceSegmentRef.setParentserviceinstance(this._parentServiceInstance);
    serializedTraceSegmentRef.setNetworkaddressusedatpeer(this._peerHost);
    serializedTraceSegmentRef.setParentendpoint(this._parentOperationName);
    return serializedTraceSegmentRef;
};
