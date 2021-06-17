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

const ContextCarrier = require("skyapm-nodejs/lib/trace/context-carrier");
const layerDefine = require("skyapm-nodejs/lib/trace/span-layer");
const componentDefine = require("skyapm-nodejs/lib/trace/component-define");

/**
 *
 * @param {amqpModule} amqpModule
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 * @author Quanjie.Deng
 */
module.exports = function(amqpModule, instrumentation, contextManager) {
    instrumentation.enhanceMethod(amqpModule, "createConnection", wrapCreateConnection);
    return amqpModule;

    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapCreateConnection(original) {
        return function() {
            let Connection = original.apply(this, arguments);
            enhanceConnectionsMethod(Connection, instrumentation, contextManager);
            return Connection;
        };
    }
};

/**
 * filterParams
 * @param {obj} obj
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 */
function enhanceConnectionsMethod(obj, instrumentation, contextManager) {
    let connection = obj;
    instrumentation.enhanceMethod(obj, "exchange", wrapCreateExchange);
    instrumentation.enhanceMethod(obj, "queue", wrapCreateQueue);
    return obj;
    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapCreateExchange(original) {
        return function() {
            let exchange = original.apply(this, arguments);
            enhanceExchangeMethod(connection, exchange, instrumentation, contextManager);
            return exchange;
        };
    }

    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapCreateQueue(original) {
        return function() {
            let queue = original.apply(this, arguments);
            enhanceQueueMethod(queue, instrumentation, contextManager);
            return queue;
        };
    }
}

/**
 * filterParams
 * @param {obj} obj
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 */
function enhanceQueueMethod(obj, instrumentation, contextManager) {
    instrumentation.enhanceMethod(obj, "subscribe", wrapQueueSubscribe);
    return obj;

    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapQueueSubscribe(original) {
        return function(options, messageListener) {
            let optionsNew = function(message) {
                let contextCarrier = new ContextCarrier();
                contextCarrier.fetchBy(function(key) {
                    if (message.headers.hasOwnProperty(key)) {
                        return message.headers[key];
                    }
                    return undefined;
                });

                let span = contextManager.createEntrySpan(obj.name, contextCarrier);
                span.component(componentDefine.Components.AMQP);
                span.spanLayer(layerDefine.Layers.MQ);

                let res = options.apply(this, arguments);
                contextManager.finishSpan(span);
                return res;
            };

            let result = original.apply(this, [optionsNew, messageListener]);
            return result;
        };
    };
}

/**
 * filterParams
 * @param {endpointName} connection
 * @param {obj} obj
 * @param {instrumentation} instrumentation
 * @param {contextManager} contextManager
 * @return {*}
 */
function enhanceExchangeMethod( connection, obj, instrumentation, contextManager) {
    let connections = connection;
    instrumentation.enhanceMethod( obj, "publish", wrapExchangePulish);
    return obj;
    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapExchangePulish(original) {
        return function(routingKey, data, options, callback) {
            let enhanceCallback = callback;
            let hasCallback = false;
            let contextCarrier = new ContextCarrier();
            let span = contextManager.createExitSpan(routingKey, connections.options.host+":"+connections.options.port, contextCarrier);
            contextCarrier.pushBy(function(key, value) {
                if (!data.hasOwnProperty("headers")) {
                    data.headers = {};
                }
                data.headers[key] = value;
            });
            span.component(componentDefine.Components.AMQP);
            span.spanLayer(layerDefine.Layers.MQ);


            if (typeof callback === "function") {
                enhanceCallback = instrumentation.enhanceCallback(span.traceContext(),
                contextManager, function() {
                    contextManager.finishSpan(span);
                    return callback.apply(this, arguments);
                });
                hasCallback = true;
            }

            let result = original.apply(this, [routingKey, data, options, enhanceCallback]);
            if (result && !hasCallback) {
                contextManager.finishSpan(span);
            }
            return result;
        };
    };
}
