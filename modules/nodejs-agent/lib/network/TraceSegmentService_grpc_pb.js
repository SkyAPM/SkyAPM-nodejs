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
var TraceSegmentService_pb = require('./TraceSegmentService_pb.js');
var Common_pb = require('./Common_pb.js');
var Downstream_pb = require('./Downstream_pb.js');
var KeyWithStringValue_pb = require('./KeyWithStringValue_pb.js');

function serialize_Downstream(arg) {
  if (!(arg instanceof Downstream_pb.Downstream)) {
    throw new Error('Expected argument of type Downstream');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_Downstream(buffer_arg) {
  return Downstream_pb.Downstream.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_UpstreamSegment(arg) {
  if (!(arg instanceof TraceSegmentService_pb.UpstreamSegment)) {
    throw new Error('Expected argument of type UpstreamSegment');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_UpstreamSegment(buffer_arg) {
  return TraceSegmentService_pb.UpstreamSegment.deserializeBinary(new Uint8Array(buffer_arg));
}


var TraceSegmentServiceService = exports.TraceSegmentServiceService = {
  collect: {
    path: '/TraceSegmentService/collect',
    requestStream: true,
    responseStream: false,
    requestType: TraceSegmentService_pb.UpstreamSegment,
    responseType: Downstream_pb.Downstream,
    requestSerialize: serialize_UpstreamSegment,
    requestDeserialize: deserialize_UpstreamSegment,
    responseSerialize: serialize_Downstream,
    responseDeserialize: deserialize_Downstream,
  },
};

exports.TraceSegmentServiceClient = grpc.makeGenericClientConstructor(TraceSegmentServiceService);
