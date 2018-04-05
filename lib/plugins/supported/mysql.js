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

/**
 * @author zhang xin
 */
module.exports = function (originModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(originModule, 'createConnection', wrapCreateConnection);

    function wrapCreateConnection(original) {
        return function wrappedCreateConnection() {
            var connection = original.apply(this, arguments);
            enhanceQueryMethod(connection, instrumentation, contextManager)
            return connection;
        }
    }

    return originModule;
}

function enhanceQueryMethod(obj, instrumentation, contextManager) {
    var connection = obj;
    return instrumentation.enhanceMethod(obj, 'query', queryInterceptor);

    function queryInterceptor(original) {
        return function wrappedQuery(sql, values, cb) {
            var span = contextManager.createExitSpan(sql, connection.config.host + ":" + connection.config.port);
            if (typeof values === 'function') {
                arguments[1] = instrumentation.enhanceCallback(span.traceContext(), contextManager, function () {
                    contextManager.finishSpan(span);
                    return values.apply(this, arguments);
                });
            } else if (typeof cb === 'function') {
                arguments[2] = instrumentation.enhanceCallback(span.traceContext(), contextManager, function () {
                    contextManager.finishSpan(span);
                    return cb.apply(this, arguments);
                });
            }

            return original.apply(this, arguments);
        }

    }
}