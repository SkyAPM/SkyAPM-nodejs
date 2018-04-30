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
module.exports = Span;

const KeyValuePair = require("./key-value-pair");
const LogDataEntity = require("./log-data-entity");
const CommonParameters = require("../network/Common_pb");
const KeyWithStringValueParameters = require("../network/KeyWithStringValue_pb");
const TraceSegmentServiceParameters = require("../network/TraceSegmentService_pb");

/**
 *
 * @param {spanOptions} spanOptions
 * @param {traceContext} traceContext
 * @constructor
 * @author zhang xin
 */
function Span(spanOptions, traceContext) {
  this._operationName = spanOptions.operationName;
  this._operationId = spanOptions.operationId;
  this._spanId = spanOptions.spanId;
  this._parentSpanId = spanOptions.parentSpanId;
  this._spanType = spanOptions.spanType;
  this._peerId = spanOptions.peerId;
  this._peerHost = spanOptions.peerHost;
  this._startTime = undefined;
  this._endTime = undefined;
  this._isError = false;
  this._spanLayer = undefined;
  this._componentId = undefined;
  this._componentName = undefined;
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

Span.prototype.fetchPeerInfo = function(registerCallback, unregisterCallback) {
  if (this._peerHost) {
    return unregisterCallback(this._peerHost);
  } else {
    return registerCallback(this._peerId);
  }
};

Span.prototype.errorOccurred = function() {
  this._isError = true;
};

Span.prototype.fetchOperationNameInfo = function(
    registerCallback, unregisterCallback) {
  if (this._operationName) {
    return unregisterCallback(this._operationName);
  } else {
    return registerCallback(this._operationId);
  }
};

Span.prototype.component = function(component) {
  this._componentId = component.getId();
};

Span.prototype.transform = function() {
  let serializedSpan = new TraceSegmentServiceParameters.SpanObject();
  serializedSpan.setSpanid(this._spanId);
  serializedSpan.setParentspanid(this._parentSpanId);
  serializedSpan.setStarttime(this._startTime);
  serializedSpan.setEndtime(this._endTime);

  this._refs.forEach(function(ref) {
    serializedSpan.addRefs(ref.transform());
  });

  if (this._operationName) {
    serializedSpan.setOperationname(this._operationName);
  } else {
    serializedSpan.setOperationnameid(this._operationId);
  }

  if (this._peerHost) {
    serializedSpan.setPeer(this._peerHost);
  } else if (this._peerId) {
    serializedSpan.setPeerid(this._peerId);
  }

  if (this.isExitSpan()) {
    serializedSpan.setSpantype(CommonParameters.SpanType.EXIT);
  } else if (this.isEntrySpan()) {
    serializedSpan.setSpantype(CommonParameters.SpanType.ENTRY);
  } else {
    serializedSpan.setSpantype(CommonParameters.SpanType.LOCAL);
  }

  serializedSpan.setIserror(this._isError);
  this._tags.forEach(function(tag) {
    let serializedTag = new KeyWithStringValueParameters.KeyWithStringValue();
    serializedTag.setKey(tag.getKey());
    serializedTag.setValue(tag.getValue());
    serializedSpan.addTags(serializedTag);
  });

  this._logs.forEach(function(log) {
    let serializedLog = new TraceSegmentServiceParameters.LogMessage();
    serializedLog.setTime(log.getTimestamp());
    log.getData().forEach(function(data) {
      let serializedData = new KeyWithStringValueParameters.KeyWithStringValue();
      serializedData.setKey(data.getKey());
      serializedData.setValue(data.getValue());
      serializedLog.addData(serializedData);
    });
    serializedSpan.addLogs(serializedLog);
  });

  if (this._componentName) {
    serializedSpan.setComponent(this._componentName);
  } else {
    serializedSpan.setComponentid(this._componentId);
  }

  if (this._spanLayer) {
    serializedSpan.setSpanlayer(this._spanLayer.getGrpcData());
  }

  return serializedSpan;
};
