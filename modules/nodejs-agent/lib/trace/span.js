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
module.exports = Span;

const KeyValuePair = require("./key-value-pair");
const LogDataEntity = require("./log-data-entity");

const CommonParameteres = require("../network/common/Common_pb");
const TraceSegmentParameteres = require("../network/language-agent/Tracing_pb");

/**
 *
 * @param {spanOptions} spanOptions
 * @param {traceContext} traceContext
 * @constructor
 * @author zhang xin
 */
function Span(spanOptions, traceContext) {
    this._operationName = spanOptions.operationName;
    this._spanId = spanOptions.spanId;
    this._parentSpanId = spanOptions.parentSpanId;
    this._spanType = spanOptions.spanType;
    this._peerHost = spanOptions.peerHost;
    this._startTime = undefined;
    this._endTime = undefined;
    this._isError = false;
    this._spanLayer = undefined;
    this._componentId = undefined;
    this._refs = [];
    this._logs = [];
    this._traceContext = traceContext;
    this._tags = [];
}

Span.prototype.start = function() {
    this._startTime = new Date().getTime();
};

Span.prototype.finish = function() {
    this._endTime = new Date().getTime();
};

Span.prototype.tag = function(key, value) {
    this._tags.push(new KeyValuePair(key, value));
};

Span.prototype.traceContext = function() {
    return this._traceContext;
};

Span.prototype.log = function(err) {
    let logEntity = [];
    logEntity.push(new KeyValuePair("event", "error"));
    logEntity.push(new KeyValuePair("error.kind", err.number));
    logEntity.push(new KeyValuePair("message", err.description));
    let logDataEntity = new LogDataEntity(new Date().getTime(), logEntity);
    this._logs.push(logDataEntity);
};

Span.prototype.ref = function(traceSegmentRef) {
    this._refs.push(traceSegmentRef);
};

Span.prototype.getSpanId = function() {
    return this._spanId;
};

Span.prototype.isEntrySpan = function() {
    return this._spanType == "ENTRY";
};

Span.prototype.isExitSpan = function() {
    return this._spanType == "EXIT";
};

Span.prototype.isLocalSpan = function() {
    return this._spanType == "LOCAL";
};

Span.prototype.component = function(component) {
    if (typeof component == "OfficeComponent") {
        this._componentId = component.getId();
    } else {
        this._componentName = component;
    }
};

Span.prototype.spanLayer = function(spanLayer) {
    this._spanLayer = spanLayer;
};

Span.prototype.peerHost = function() {
    return this._peerHost;
};

Span.prototype.errorOccurred = function() {
    this._isError = true;
};

Span.prototype.operationName = function() {
    return this._operationName;
};

Span.prototype.component = function(component) {
    this._componentId = component.getId();
};

Span.prototype.transform = function() {
    let serializedSpan = new TraceSegmentParameteres.SpanObject();
    serializedSpan.setSpanid(this._spanId);
    serializedSpan.setParentspanid(this._parentSpanId);
    serializedSpan.setStarttime(this._startTime);
    serializedSpan.setEndtime(this._endTime);
    serializedSpan.setOperationname(this._operationName);
    serializedSpan.setComponentid(this._componentId);

    this._refs.forEach(function(ref) {
        serializedSpan.addRefs(ref.transform());
    });

    if (this._peerHost) {
        serializedSpan.setPeer(this._peerHost);
    }

    if (this.isExitSpan()) {
        serializedSpan.setSpantype(TraceSegmentParameteres.SpanType.EXIT);
    } else if (this.isEntrySpan()) {
        serializedSpan.setSpantype(TraceSegmentParameteres.SpanType.ENTRY);
    } else {
        serializedSpan.setSpantype(TraceSegmentParameteres.SpanType.LOCAL);
    }

    serializedSpan.setIserror(this._isError);
    this._tags.forEach(function(tag) {
        let serializedTag = new CommonParameteres.KeyStringValuePair();
        serializedTag.setKey(tag.getKey());
        serializedTag.setValue(tag.getValue());
        serializedSpan.addTags(serializedTag);
    });

    this._logs.forEach(function(log) {
        let serializedLog = new TraceSegmentParameteres.Log();
        serializedLog.setTime(log.getTimestamp());
        log.getData().forEach(function(data) {
            let serializedData = new CommonParameteres.KeyStringValuePair();
            serializedData.setKey(data.getKey());
            serializedData.setValue(data.getValue());
            serializedLog.addData(serializedData);
        });
        serializedSpan.addLogs(serializedLog);
    });

    if (this._spanLayer) {
        serializedSpan.setSpanlayer(this._spanLayer.getGrpcData());
    }

    return serializedSpan;
};
