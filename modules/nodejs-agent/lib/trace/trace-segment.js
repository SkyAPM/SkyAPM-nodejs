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

module.exports = TraceSegment;

const ID = require("./trace-segment-id");
const agentConfig = require("../config");
const traceSegmentCache = require("../cache");

const TraceSegmentParameteres = require("../network/language-agent/Tracing_pb");

/**
 * @class TraceSegment
 * @author zhang xin
 */
function TraceSegment() {
    this._traceSegmentId = new ID();
    this._finishedSpan = [];
    this._runningSpanSize = 0;
    this._spanIdGenerator = 0;
    this._entryOperationName = undefined;
    this._traceId = new ID();
    this._refs = [];
}

TraceSegment.prototype.traceSegmentId = function() {
    return this._traceSegmentId;
};

TraceSegment.prototype.archive = function(span) {
    this._finishedSpan.push(span);

    if ((--this._runningSpanSize) === 0) {
        this.finish();
        return true;
    }
    return false;
};

TraceSegment.prototype.finish = function() {
    traceSegmentCache.put(this);
};

TraceSegment.prototype.generateSpanId = function(spanOptions, callback) {
    this._runningSpanSize++;
    if (this._spanIdGenerator == 0) {
        this._entryOperationName = spanOptions["operationName"];
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

TraceSegment.prototype.traceId = function() {
    if (this._refs.length > 0) {
        return this._refs[0].getPrimaryDistributedTraceId();
    } else {
        return this._traceId;
    }
};

TraceSegment.prototype.entryOperationName = function() {
    return this._entryOperationName;
};

TraceSegment.prototype.transform = function() {
    let serializeTraceSegmentObject = new TraceSegmentParameteres.SegmentObject();

    /**
     * @param {traceSegmentId} traceSegmentId
     * @return {TraceSegmentServiceParameters.UniqueId}
     */
    function buildTraceSegmentId(traceSegmentId) {
        return traceSegmentId.part1() + "." + traceSegmentId.part2() + "." + traceSegmentId.part3();
    }

    serializeTraceSegmentObject.setTracesegmentid(buildTraceSegmentId(this._traceSegmentId));
    this._finishedSpan.forEach(function(span) {
        serializeTraceSegmentObject.addSpans(span.transform());
    });

    serializeTraceSegmentObject.setService(agentConfig.getServiceName());
    serializeTraceSegmentObject.setServiceinstance(agentConfig.getInstanceName());
    serializeTraceSegmentObject.setIssizelimited(false);

    if (this._refs.length > 0) {
        serializeTraceSegmentObject.setTraceid(buildTraceSegmentId(this._refs[0].getPrimaryDistributedTraceId()));
    } else {
        serializeTraceSegmentObject.setTraceid(buildTraceSegmentId(this._traceId));
    }

    return serializeTraceSegmentObject;
};
