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

module.exports = ContextManager;
const TraceContext = require("./trace-context");

/**
 * @author zhang xin
 */
function ContextManager() {
    this._activeTraceContext = undefined;
    this._createSpan = function(spanOptions) {
        let traceContext = new TraceContext(this._activeTraceContext, spanOptions);
        return traceContext.span();
    };
};

ContextManager.prototype.inject = function(contextCarrier) {
    this._activeTraceContext.inject.apply(this._activeTraceContext, [contextCarrier]);
};

ContextManager.prototype.extract = function(contextCarrier) {
    this._activeTraceContext.extract.apply(this._activeTraceContext, [contextCarrier]);
};

ContextManager.prototype.finishSpan = function(span) {
    let finishTraceContext = span.traceContext();
    if (finishTraceContext.finish(span)) {
        this.active(undefined);
    } else {
        this.active(finishTraceContext.parentTraceContext.apply(finishTraceContext, []));
    }
};

ContextManager.prototype.unActive = function(span) {
    this.active(undefined);
};

ContextManager.prototype.active = function(traceContext) {
    this._activeTraceContext = traceContext;
};

ContextManager.prototype.activeTraceContext = function() {
    return this._activeTraceContext;
};

ContextManager.prototype.createEntrySpan = function(
    operationName, contextCarrier) {
    let spanOptions = {
        spanType: "ENTRY",
        operationName: operationName,
    };

    let span = this._createSpan(spanOptions);
    this.active(span.traceContext());

    if (contextCarrier) {
        span.traceContext().extract.apply(span.traceContext(), [contextCarrier]);
    }

    return span;
};

ContextManager.prototype.createExitSpan = function(
    operationName, peerId, contextCarrier) {
    let spanOptions = {
        spanType: "EXIT",
        operationName: operationName,
        peerHost: peerId,
    };

    let span = this._createSpan(spanOptions);

    if (contextCarrier) {
        span.traceContext().inject.apply(span.traceContext(), [contextCarrier]);
    }

    return span;
};

ContextManager.prototype.createLocalSpan = function(operationName) {
    let spanOptions = {
        spanType: "LOCAL",
        operationName: operationName,
    };

    let span = this._createSpan(spanOptions);
    this.active(span.traceContext());
    return span;
};

ContextManager.prototype.rewriteOperationName = function(span, operationName) {
    span._operationName = operationName;
};

ContextManager.prototype.rewriteEntrySpanInfo = function(span, spanInfo) {
    let self = this;
    Object.keys(spanInfo).forEach(function(property) {
        if (property == "operationName") {
            self.rewriteOperationName(span, spanInfo[property]);
        } else {
            span[property](spanInfo[property]);
        }
    });
};
