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

const TraceSegmentServiceParameters = require("../network/common/trace-common_pb");

/**
 *
 * @param {id} id
 * @param {grpcData} grpcData
 * @constructor
 */
function Layer(id, grpcData) {
    this._id = id;
    this._grpcData = grpcData;
}

Layer.prototype.getId = function() {
    return this._id;
};

Layer.prototype.getGrpcData = function() {
    return this._grpcData;
};

let Layers = function() {
    this.DB = new Layer(1, TraceSegmentServiceParameters.SpanLayer.DATABASE);
    this.RPC_FRAMEWORK = new Layer(2, TraceSegmentServiceParameters.SpanLayer.RPCFRAMEWORK);
    this.HTTP = new Layer(3, TraceSegmentServiceParameters.SpanLayer.HTTP);
    this.MQ = new Layer(4, TraceSegmentServiceParameters.SpanLayer.MQ);
    this.CACHE = new Layer(5, TraceSegmentServiceParameters.SpanLayer.CACHE);
};

Layers.instance = null;

Layers.getInstance = function() {
    if (this.instance === null) {
        this.instance = new Layers();
    }
    return this.instance;
};

exports.Layer = Layer;
exports.Layers = Layers.getInstance();
