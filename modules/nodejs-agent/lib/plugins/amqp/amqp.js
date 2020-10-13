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
    console.log("amqp  hook");
    instrumentation.enhanceMethod(amqpModule, "createConnection", wrapCreateConnection);
    return amqpModule;

    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapCreateConnection(original) {
        console.log("amqp createConnection 拦截触发");
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
    // instrumentation.enhanceMethod(obj, "queue", wrapCreateQueue);
    return obj;
    /**
     * filterParams
     * @param {original} original
     * @return {*}
     */
    function wrapCreateExchange(original) {
        console.log("amqp exchange 拦截触发");
        return function() {
            let exchange = original.apply(this, arguments);
            enhanceExchangeMethod(connection, exchange, instrumentation, contextManager);
            return exchange;
        };
    }

    // function wrapCreateQueue(original){
    //     console.log("amqp Queue 拦截触发");
    //     return  function(){
    //         let queue = original.apply(this, arguments);
    //         enhanceQueueMethod(connection,queue, instrumentation, contextManager);
    //         return queue;
    //     }
    // }
}

// function enhanceQueueMethod(connection,obj, instrumentation, contextManager){
//     let  connections =  connection;
//     let  queue = obj;
//     instrumentation.enhanceMethod(obj, "subscribe", wrapQueueSubscribe);
//     return obj;

//     function  wrapQueueSubscribe(original){
//         console.log("amqp Queue  Subscribe 拦截触发");
//         return function(options, messageListener){
//             console.log(`subscribe----options:${options} `);
//             console.log(`subscribe----messageListener:${messageListener} `);
//             // let span = contextManager.createExitSpan(routingKey, connections.options.host+":"+connections.options.port);

//             // let contextCarrier = new ContextCarrier();
//             // let span = contextManager.createExitSpan(options.path, (options.hostname || options.host) + ":" + options.port, contextCarrier);
//             // contextCarrier.pushBy(function(key, value) {
//             //     if (!options.hasOwnProperty("headers") || !options.headers) {
//             //         options.headers = {};
//             //     }
//             //     options.headers[key] = value;
//             // });
//             // span.component(componentDefine.Components.HTTP);
//             // span.spanLayer(layerDefine.Layers.HTTP);
//             let result = original.apply(this, arguments);
//             // contextManager.finishSpan(span);
//             return result;
//         }
//     };
// }

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
        console.log("amqp exchange-publish 拦截触发");
        return function(routingKey, data, options, callback) {
            console.log("amqp wrapRequest function 参数1:"+routingKey);
            console.log("amqp wrapRequest function 参数2:"+JSON.stringify(data));
            console.log("amqp wrapRequest function connections:"+ connections.options.host+":"+connections.options.port);
            let enhanceCallback = callback;
            let hasCallback = false;
            let contextCarrier = new ContextCarrier();
            let span = contextManager.createExitSpan(routingKey, connections.options.host+":"+connections.options.port);
            contextCarrier.pushBy(function(key, value) {
                if (!data.hasOwnProperty("headers")) {
                    data.headers = {};
                }
                data.headers[key] = value;
                console.log("添加 ContextCarrier  k-v:"+key+":"+value);
            });
            console.log("amqp wrapRequest function 参数2-2:"+JSON.stringify(data));
            span.component(componentDefine.Components.AMQP);
            span.spanLayer(layerDefine.Layers.MQ);


            if (typeof callback === "function") {
                console.log("amqp  publish call_back is function");
                enhanceCallback = instrumentation.enhanceCallback(span.traceContext(),
                contextManager, function() {
                    console.log(" exchange-publish call_back 触发");
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
