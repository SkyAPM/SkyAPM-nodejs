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

const NoopSpan = require("./noop-span");
const NoopTraceSegment = require("./noop-trace-segment");

module.exports = NoopTraceContext;

const NOOP_TRACE_SEGMENT = new NoopTraceSegment();

/**
 *
 * @param {parentTraceContext} parentTraceContext
 * @param {spanOptions} spanOptions
 * @constructor
 * @author zhang xin
 */
function NoopTraceContext(parentTraceContext, spanOptions) {
    this._noopSpan = new NoopSpan(this);
    this._parentTraceContext = parentTraceContext;
}

NoopTraceContext.prototype.span = function() {
    return this._noopSpan;
};

NoopTraceContext.prototype.finish = function() {
};

NoopTraceContext.prototype.parentTraceContext = function() {
    return this._parentTraceContext;
};

NoopTraceContext.prototype.spanId = function() {
    return -1;
};

NoopTraceContext.prototype.inject = function(contextCarrier) {
};

NoopTraceContext.prototype.extract = function(contextCarrier) {
};

NoopTraceContext.prototype.traceSegment = function() {
    return NOOP_TRACE_SEGMENT;
};

