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
var NetworkAddressRegisterService_pb = require('./NetworkAddressRegisterService_pb.js');
var KeyWithIntegerValue_pb = require('./KeyWithIntegerValue_pb.js');

function serialize_NetworkAddressMappings(arg) {
  if (!(arg instanceof NetworkAddressRegisterService_pb.NetworkAddressMappings)) {
    throw new Error('Expected argument of type NetworkAddressMappings');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_NetworkAddressMappings(buffer_arg) {
  return NetworkAddressRegisterService_pb.NetworkAddressMappings.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_NetworkAddresses(arg) {
  if (!(arg instanceof NetworkAddressRegisterService_pb.NetworkAddresses)) {
    throw new Error('Expected argument of type NetworkAddresses');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_NetworkAddresses(buffer_arg) {
  return NetworkAddressRegisterService_pb.NetworkAddresses.deserializeBinary(new Uint8Array(buffer_arg));
}


var NetworkAddressRegisterServiceService = exports.NetworkAddressRegisterServiceService = {
  batchRegister: {
    path: '/NetworkAddressRegisterService/batchRegister',
    requestStream: false,
    responseStream: false,
    requestType: NetworkAddressRegisterService_pb.NetworkAddresses,
    responseType: NetworkAddressRegisterService_pb.NetworkAddressMappings,
    requestSerialize: serialize_NetworkAddresses,
    requestDeserialize: deserialize_NetworkAddresses,
    responseSerialize: serialize_NetworkAddressMappings,
    responseDeserialize: deserialize_NetworkAddressMappings,
  },
};

exports.NetworkAddressRegisterServiceClient = grpc.makeGenericClientConstructor(NetworkAddressRegisterServiceService);
