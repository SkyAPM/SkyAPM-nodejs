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

const ID = require("./trace-segment-id");
const TraceSegmentServiceParameters = require("../network/TraceSegmentService_pb");

/**
 *
 * @param {contextCarrier} contextCarrier
 * @constructor
 * @author zhang xin
 */
function TraceSegmentRef(contextCarrier) {
    let that = this;

    this.type = "CROSS_PROCESS";
    let idSegment = contextCarrier.getTraceSegmentId().split(".");
    this._traceSegmentId = new ID({
        part1: idSegment[0],
        part2: idSegment[1],
        part3: idSegment[2],
    });
    this._spanId = contextCarrier.getSpanId();

    this._entryApplicationInstanceId = contextCarrier.getEntryApplicationInstanceId();
    this._parentApplicationInstanceId = contextCarrier.getParentApplicationInstanceId();

    contextCarrier.fetchPeerHostInfo(function(peerId) {
        that._peerId = peerId;
    }, function(peerHost) {
        that._peerHost = peerHost;
    });

    contextCarrier.fetchEntryOperationNameInfo(function(operationId) {
        that._entryOperationId = operationId;
    }, function(operationName) {
        that._entryOperationName = operationName;
    });

    contextCarrier.fetchParentOperationNameInfo(function(parentOperationId) {
        that._parentOperationId = parentOperationId;
    }, function(parentOperationName) {
        that._parentOperationName = parentOperationName;
    });

    let primaryDistributedTraceId = contextCarrier.getPrimaryDistributedTraceId().split(".");
    this._primaryDistributedTraceId = new ID({
        part1: primaryDistributedTraceId[0],
        part2: primaryDistributedTraceId[1],
        part3: primaryDistributedTraceId[2],
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


TraceSegmentRef.prototype.getPrimaryDistributedTraceId = function() {
    return this._primaryDistributedTraceId;
};

TraceSegmentRef.prototype.transform = function() {
    let serializedTraceSegmentRef = new TraceSegmentServiceParameters.TraceSegmentReference();
    serializedTraceSegmentRef.setReftype(TraceSegmentServiceParameters.RefType.CROSSPROCESS);

    /**
     * @param {traceSegmentId} traceSegmentId
     * @return {TraceSegmentServiceParameters.UniqueId}
     */
    function buildUniqueId(traceSegmentId) {
        let serializedUniqueId = new TraceSegmentServiceParameters.UniqueId();
        serializedUniqueId.addIdparts(traceSegmentId.part1());
        serializedUniqueId.addIdparts(traceSegmentId.part2());
        serializedUniqueId.addIdparts(traceSegmentId.part3());
        return serializedUniqueId;
    }

    serializedTraceSegmentRef.setParenttracesegmentid(buildUniqueId(this._traceSegmentId));
    serializedTraceSegmentRef.setParentspanid(this._spanId);
    serializedTraceSegmentRef.setParentapplicationinstanceid(this._parentApplicationInstanceId);

    if (this._peerHost) {
        serializedTraceSegmentRef.setNetworkaddress(this._peerHost);
    } else {
        serializedTraceSegmentRef.setNetworkaddressid(this._peerId);
    }

    serializedTraceSegmentRef.setEntryapplicationinstanceid(this._entryApplicationInstanceId);

    if (this._entryOperationName) {
        serializedTraceSegmentRef.setEntryservicename(this._entryOperationName);
    } else {
        serializedTraceSegmentRef.setEntryserviceid(this._entryOperationId);
    }

    if (this._parentOperationName) {
        serializedTraceSegmentRef.setParentservicename(this._parentOperationName);
    } else {
        serializedTraceSegmentRef.setParentserviceid(this._parentOperationId);
    }

    return serializedTraceSegmentRef;
};
