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
var ApplicationRegisterService_pb = require('./ApplicationRegisterService_pb.js');
var KeyWithIntegerValue_pb = require('./KeyWithIntegerValue_pb.js');

function serialize_Application(arg) {
  if (!(arg instanceof ApplicationRegisterService_pb.Application)) {
    throw new Error('Expected argument of type Application');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_Application(buffer_arg) {
  return ApplicationRegisterService_pb.Application.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ApplicationMapping(arg) {
  if (!(arg instanceof ApplicationRegisterService_pb.ApplicationMapping)) {
    throw new Error('Expected argument of type ApplicationMapping');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ApplicationMapping(buffer_arg) {
  return ApplicationRegisterService_pb.ApplicationMapping.deserializeBinary(new Uint8Array(buffer_arg));
}


// register service for ApplicationCode, this service is called when service starts.
var ApplicationRegisterServiceService = exports.ApplicationRegisterServiceService = {
  applicationCodeRegister: {
    path: '/ApplicationRegisterService/applicationCodeRegister',
    requestStream: false,
    responseStream: false,
    requestType: ApplicationRegisterService_pb.Application,
    responseType: ApplicationRegisterService_pb.ApplicationMapping,
    requestSerialize: serialize_Application,
    requestDeserialize: deserialize_Application,
    responseSerialize: serialize_ApplicationMapping,
    responseDeserialize: deserialize_ApplicationMapping,
  },
};

exports.ApplicationRegisterServiceClient = grpc.makeGenericClientConstructor(ApplicationRegisterServiceService);
