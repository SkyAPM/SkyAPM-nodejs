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

'use strict'
var endOfStream = require("end-of-stream");
var ContextCarrier = require('../../trace/context-carrier')

/**
 * @author zhang xin
 */
module.exports = function (httpModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(httpModule && httpModule.Server && httpModule.Server.prototype, 'emit', wrapEmit);

    instrumentation.enhanceMethod(httpModule, 'request', wrapRequest);

    return httpModule;

    function wrapEmit(original) {
        return function wrappedEmit(event, req, res) {
            if (event === 'request') {
                var contextCarrier = new ContextCarrier();
                contextCarrier.fetchBy(function (key) {
                    if (req.headers.hasOwnProperty(key)) {
                       return req.headers[key];
                    }
                    return undefined;
                });

                var span = contextManager.createEntrySpan(req.url, contextCarrier);
                endOfStream(res, function (err) {
                    if (err) {
                        span.errorOccurred();
                        span.log(err);
                    }

                    if (this.statusCode > 400) {
                        span.errorOccurred();
                    }

                    contextManager.finishSpan(span);
                })
            }
            return original.apply(this, arguments);
        }
    }

    function wrapRequest(original) {
        return function wrappedRequest(options, callback) {
            var contextCarrier = new ContextCarrier();
            var span = contextManager.createExitSpan(options.path, options.host + ":" + options.port, contextCarrier);
            contextCarrier.pushBy(function (key, value) {
                options.headers[key] = value;
            })
            var result = original.apply(this, arguments);
            contextManager.finishSpan(span);
            return result;
        }
    }
}