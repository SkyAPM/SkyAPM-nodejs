// GENERATED CODE -- DO NOT EDIT!

// Original file comments:
//
// Licensed to the Apache Software Foundation (ASF) under one or more
// contributor license agreements.  See the NOTICE file distributed with
// this work for additional information regarding copyright ownership.
// The ASF licenses this file to You under the Apache License, Version 2.0
// (the "License"); you may not use this file except in compliance with
// the License.  You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
//
'use strict';
var grpc = require('grpc');
var JVMMetricsService_pb = require('./JVMMetricsService_pb.js');
var Downstream_pb = require('./Downstream_pb.js');

function serialize_Downstream(arg) {
  if (!(arg instanceof Downstream_pb.Downstream)) {
    throw new Error('Expected argument of type Downstream');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_Downstream(buffer_arg) {
  return Downstream_pb.Downstream.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_JVMMetrics(arg) {
  if (!(arg instanceof JVMMetricsService_pb.JVMMetrics)) {
    throw new Error('Expected argument of type JVMMetrics');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_JVMMetrics(buffer_arg) {
  return JVMMetricsService_pb.JVMMetrics.deserializeBinary(new Uint8Array(buffer_arg));
}


var JVMMetricsServiceService = exports.JVMMetricsServiceService = {
  collect: {
    path: '/JVMMetricsService/collect',
    requestStream: false,
    responseStream: false,
    requestType: JVMMetricsService_pb.JVMMetrics,
    responseType: Downstream_pb.Downstream,
    requestSerialize: serialize_JVMMetrics,
    requestDeserialize: deserialize_JVMMetrics,
    responseSerialize: serialize_Downstream,
    responseDeserialize: deserialize_Downstream,
  },
};

exports.JVMMetricsServiceClient = grpc.makeGenericClientConstructor(JVMMetricsServiceService);
