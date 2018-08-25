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

module.exports = ContextManager;
const TraceContext = require("./trace-context");
const DictionaryManager = require("../dictionary/dictionary-manager");
const AgentConfig = require("../config");
const NoopSpan = require("./noop-span");
const NoopTraceContext = require("./noop-trace-context");
const logger = require("../logger");

const NOOP_TRACE_CONTEXT = new NoopTraceContext();
const NOOP_SPAN = new NoopSpan(NOOP_TRACE_CONTEXT);

/**
 * @author zhang xin
 */
function ContextManager() {
    this._activeTraceContext = undefined;
    this._dictionaryManager = new DictionaryManager();
    this._createSpan = function(spanOptions) {
        let traceContext = NOOP_TRACE_CONTEXT;
        if (!AgentConfig.getApplicationId() ||
            !AgentConfig.getApplicationInstanceId()) {
            logger.debug("context-manager", "use the noop-span before the application has been registered.");
            return traceContext.span();
        }

        if (typeof this._activeTraceContext == "NoopTraceContext") {
            logger.debug("context-manager",
                "use the noop-span because of the parent trace context is NoopTraceContext.");
            return traceContext.span();
        }

        traceContext = new TraceContext(this._activeTraceContext, spanOptions);
        return traceContext.span();
    };
};

ContextManager.prototype.inject = function(contextCarrier) {
    if (!AgentConfig.getApplicationId()) {
        return;
    }

    this._activeTraceContext.inject.apply(activeTraceContext, [contextCarrier]);
};

ContextManager.prototype.extract = function(contextCarrier) {
    if (!AgentConfig.getApplicationId()) {
        return;
    }

    this._activeTraceContext.extract.apply(this._activeTraceContext, [contextCarrier]);
};

ContextManager.prototype.finishSpan = function(span) {
    let finishTraceContext = span.traceContext();
    finishTraceContext.finish(span);
    this.active(finishTraceContext.parentTraceContext.apply(finishTraceContext, []));
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
    };

    this._dictionaryManager.findOperationName(operationName,
        function(key, value) {
            spanOptions[key] = value;
        });

    let span = this._createSpan(spanOptions);
    this.active(span.traceContext());

    if (contextCarrier) {
        span.traceContext().extract.apply(span.traceContext(), [contextCarrier, this._agentConfig]);
    }

    return span;
};

ContextManager.prototype.createExitSpan = function(
    operationName, peerId, contextCarrier) {
    if (!AgentConfig.getApplicationId()) {
        logger.debug("context-manager", "use the noop-span before the application has been registered.");
        return NOOP_SPAN;
    }

    let spanOptions = {
        spanType: "EXIT",
    };

    this._dictionaryManager.findOperationName(operationName,
        function(key, value) {
            spanOptions[key] = value;
        });

    this._dictionaryManager.findNetworkAddress(peerId, function(key, value) {
        spanOptions[key] = value;
    });

    let span = this._createSpan(spanOptions);

    if (contextCarrier) {
        span.traceContext().inject.apply(span.traceContext(), [contextCarrier]);
    }

    return span;
};

ContextManager.prototype.createLocalSpan = function(operationName) {
    let spanOptions = {
        spanType: "LOCAL",
    };

    this._dictionaryManager.findOperationName(operationName,
        function(key, value) {
            spanOptions[key] = value;
        });

    let span = this._createSpan(spanOptions);
    this.active(span.traceContext());

    return span;
};

ContextManager.prototype.rewriteOperationName = function(span, operationName) {
    this._dictionaryManager.findOperationName(operationName,
        function(key, value) {
            if (key == "operationName") {
                span._operationName = value;
            }
            if (key == "operationId") {
                span._operationId = value;
            }
        });
};

ContextManager.prototype.rewriteSpanInfo = function(span, spanInfo) {
    let self = this;
    Object.keys(spanInfo).forEach(function(property) {
        if (property == "operationName") {
            self.rewriteOperationName(span, spanInfo[property]);
        } else {
            span[property](spanInfo[property]);
        }
    });
};
