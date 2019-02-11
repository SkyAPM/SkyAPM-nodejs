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


module.exports = Instrumentation;
const logger = require("../logger");

/**
 * @constructor
 * @author zhang xin
 */
function Instrumentation() {
}

/**
 * Enhance method.
 *
 * Consider this pseudocode example:
 *  var codeEnhancer = ... //
 *  var enhanceObject = ... //
 *  var interceptor = function (){
 *      // do something enhance
 *  }
 * @param {enhanceObject} enhanceObject
 * @param {enhanceMethod} enhanceMethod
 * @param {interceptor} interceptor
 * @return {wrappedMethod} wrapped method
 */
Instrumentation.prototype.enhanceMethod = function(enhanceObject, enhanceMethod, interceptor) {
    if (!(enhanceObject && (enhanceObject[enhanceMethod] || enhanceObject.prototype[enhanceMethod]))) {
        return;
    }

    if (!interceptor) {
        return;
    }

    let original = enhanceObject[enhanceMethod];

    if (!original) {
        original = enhanceObject.prototype[enhanceMethod];
    }

    if (!original) {
        return;
    }

    if (!this.isFunction(original) || !this.isFunction(interceptor)) {
        return;
    }
    let wrapped = interceptor(original, enhanceMethod);
    if (!enhanceObject[enhanceMethod]) {
        enhanceObject.prototype[enhanceMethod] = wrapped;
    } else {
        enhanceObject[enhanceMethod] = wrapped;
    }

    return wrapped;
};

/**
 * Enhance the call back method.
 *
 * Consider this pseudocode example:
 * var originCallback = enhanceObject.callback;
 *   enhanceObject.callback = codeEnhancer.enhanceCallback(function(){
 *      // do something enhance
 *
 *      // call origin callback
 *      originCallback.apply(this, argument);
 *
 *      //
 *   });
 *
 * @param {traceContext} traceContext
 * @param {contextManager} contextManager
 * @param {originCallBack} originCallBack
 * @return {wrappedCallback} wrappedCallback
 */
Instrumentation.prototype.enhanceCallback = function(
    traceContext, contextManager, originCallBack) {
    if (typeof originCallBack !== "function") return originCallBack;

    if (!traceContext) {
        logger.warn("skyapm-instrumentation",
            "The Callback method won't be enhance because of TraceContext is undefined.");
        return originCallBack;
    }

    let runningTraceContext = traceContext;
    let runningSpan = runningTraceContext.span();

    return function() {
        let previousTraceContext = contextManager.activeTraceContext();
        contextManager.active(runningTraceContext);
        let result = undefined;
        try {
            result = originCallBack.apply(this, arguments);
        } catch (err) {
            runningSpan.errorOccurred();
            runningSpan.log(err);
            throw err;
        } finally {
            contextManager.active(previousTraceContext);
        }
        return result;
    };
};

Instrumentation.prototype.isFunction = function(funktion) {
    return funktion && ({}.toString.call(funktion) === "[object Function]" ||
        funktion[Symbol.toStringTag] === "AsyncFunction");
};
