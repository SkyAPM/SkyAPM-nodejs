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

module.exports = TraceContext;
const Span = require("./span");
const TraceSegment = require("./trace-segment");
const TraceSegmentRef = require("./trace-segment-ref");
const AgentConfig = require("../config");

/**
 *
 * @param {parentTraceContext} parentTraceContext
 * @param {spanOptions} spanOptions
 * @constructor
 * @author zhang xin
 */
function TraceContext(parentTraceContext, spanOptions) {
    if (parentTraceContext) {
        this._traceSegment = parentTraceContext.traceSegment();
    } else {
        this._traceSegment = new TraceSegment();
    }

    this._parentTraceContext = parentTraceContext;
    this._traceSegment.generateSpanId(spanOptions, function(spanId) {
        spanOptions["spanId"] = spanId;
    });
    spanOptions["parentSpanId"] = parentTraceContext ? parentTraceContext.spanId() : -1;
    this._span = new Span(spanOptions, this);
    this._span.start();
}

TraceContext.prototype.span = function() {
    return this._span;
};

TraceContext.prototype.finish = function() {
    this._span.finish.apply(this._span, []);
    this._traceSegment.archive.apply(this._traceSegment, [this._span]);
};


TraceContext.prototype.parentTraceContext = function() {
    return this._parentTraceContext;
};

TraceContext.prototype.spanId = function() {
    let span = this._span;
    return span.getSpanId.apply(span, []);
};

TraceContext.prototype.inject = function(contextCarrier) {
    if (!contextCarrier || !this._span.isExitSpan()) {
        return;
    }

    let primaryDistributedTraceId = undefined;
    let entryApplicationInstanceId = undefined;
    let traceSegment = this._traceSegment;
    this._traceSegment.fetchRefsInfo(function(refs) {
        let firstSegmentRef = refs[0];

        firstSegmentRef.fetchEntryOperationNameInfo(function(entryOperationId) {
            contextCarrier.setEntryOperationId(entryOperationId);
        }, function(entryOperationName) {
            contextCarrier.setEntryOperationName(entryOperationName);
        });

        primaryDistributedTraceId = firstSegmentRef.getPrimaryDistributedTraceId();
        entryApplicationInstanceId = firstSegmentRef.getEntryApplicationInstanceId();
    }, function() {
        traceSegment.fetchEntryOperationNameInfo(function(operationId) {
            contextCarrier.setEntryOperationId(operationId);
        }, function(operationName) {
            contextCarrier.setEntryOperationName(operationName);
        });

        entryApplicationInstanceId = AgentConfig.getApplicationInstanceId();
        primaryDistributedTraceId = traceSegment.traceSegmentId().encode();
    });

    this._span.fetchOperationNameInfo(function(operationId) {
        contextCarrier.setParentOperationId(operationId);
    }, function(operationName) {
        contextCarrier.setParentOperationName(operationName);
    });


    this._span.fetchPeerInfo(function(peerId) {
        contextCarrier.setPeerId(peerId);
    }, function(peerHost) {
        contextCarrier.setPeerHost(peerHost);
    });

    contextCarrier.setSpanId(this.spanId());
    contextCarrier.setEntryApplicationInstanceId(entryApplicationInstanceId);
    contextCarrier.setPrimaryDistributedTraceId(primaryDistributedTraceId);
    contextCarrier.setTraceSegmentId(this._traceSegment.traceSegmentId());
    contextCarrier.setParentApplicationInstanceId(
        AgentConfig.getApplicationInstanceId());
};

TraceContext.prototype.extract = function(contextCarrier) {
    if (!contextCarrier || contextCarrier.isInvalidate()) {
        return;
    }
    let traceSegmentRef = new TraceSegmentRef(contextCarrier);
    this._span.ref.apply(this._span, [traceSegmentRef]);
    this._traceSegment.ref.apply(this._traceSegment, [traceSegmentRef]);
};

TraceContext.prototype.traceSegment = function() {
    return this._traceSegment;
};
