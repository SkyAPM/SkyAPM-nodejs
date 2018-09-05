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

"use strict";

module.exports = TraceSegment;

const ID = require("./trace-segment-id");
const AgentConfig = require("../config");
const traceSegmentCache = require("../cache");
const TraceSegmentServiceParameters = require("../network/TraceSegmentService_pb");

/**
 * @author zhang xin
 */
function TraceSegment() {
    this._traceSegmentId = new ID();
    this._finishedSpan = [];
    this._runningSpanSize = 0;
    this._spanIdGenerator = 0;
    this._entryOperationName = undefined;
    this._entryOperationId = undefined;
    this._refs = [];
}

TraceSegment.prototype.traceSegmentId = function() {
    return this._traceSegmentId;
};

TraceSegment.prototype.archive = function(span) {
    this._finishedSpan.push(span);

    if ((--this._runningSpanSize) == 0) {
        this.finish();
    }
};

TraceSegment.prototype.finish = function() {
    traceSegmentCache.put(this);
};

TraceSegment.prototype.generateSpanId = function(spanOptions, callback) {
    this._runningSpanSize++;
    if (this._spanIdGenerator == 0) {
        if (spanOptions["operationName"]) {
            this._entryOperationName = spanOptions["operationName"];
        } else {
            this._entryOperationId = spanOptions["operationId"];
        }
    }
    return callback(this._spanIdGenerator++);
};

TraceSegment.prototype.ref = function(traceSegmentRef) {
    this._refs.push(traceSegmentRef);
};

TraceSegment.prototype.fetchRefsInfo = function(hasRefCallback, noRefCallback) {
    if (this._refs.length > 0) {
        return hasRefCallback(this._refs);
    } else {
        return noRefCallback();
    }
};

TraceSegment.prototype.fetchEntryOperationNameInfo = function(
    registerCallback, unregisterCallback) {
    if (this._entryOperationName) {
        return unregisterCallback(this._entryOperationName);
    } else {
        return registerCallback(this._entryOperationId);
    }
};

TraceSegment.prototype.transform = function() {
    let serializedSegment = new TraceSegmentServiceParameters.UpstreamSegment();
    let serializeTraceSegmentObject = new TraceSegmentServiceParameters.TraceSegmentObject();

    /**
     * @param {traceSegmentId} traceSegmentId
     * @return {TraceSegmentServiceParameters.UniqueId}
     */
    function buildTraceSegmentId(traceSegmentId) {
        let serializeTraceSegmentId = new TraceSegmentServiceParameters.UniqueId();
        serializeTraceSegmentId.addIdparts(traceSegmentId.part1());
        serializeTraceSegmentId.addIdparts(traceSegmentId.part2());
        serializeTraceSegmentId.addIdparts(traceSegmentId.part3());
        return serializeTraceSegmentId;
    }

    serializeTraceSegmentObject.setTracesegmentid(buildTraceSegmentId(this._traceSegmentId));
    this._finishedSpan.forEach(function(span) {
        serializeTraceSegmentObject.addSpans(span.transform());
    });
    serializeTraceSegmentObject.setApplicationid(AgentConfig.getApplicationId());
    serializeTraceSegmentObject.setApplicationinstanceid(AgentConfig.getApplicationInstanceId());
    serializeTraceSegmentObject.setIssizelimited(false);

    if (this._refs.length > 0) {
        this._refs.forEach(function(ref) {
            serializedSegment.addGlobaltraceids(buildTraceSegmentId(ref.getPrimaryDistributedTraceId()));
        });
    } else {
        serializedSegment.addGlobaltraceids(buildTraceSegmentId(this._traceSegmentId));
    }
    serializedSegment.setSegment(serializeTraceSegmentObject.serializeBinary());

    return serializedSegment;
};
