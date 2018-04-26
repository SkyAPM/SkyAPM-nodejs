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
  this._refs = [];
  this._logs = [];
  this._traceContext = traceContext;
  this._tags = [];
}

Span.prototype.start = function() {
  this._startTime = process.uptime();
};

Span.prototype.finish = function() {
  this._endTime = process.uptime() - this._startTime;
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
