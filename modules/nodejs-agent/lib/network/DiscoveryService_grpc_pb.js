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
var DiscoveryService_pb = require('./DiscoveryService_pb.js');
var Common_pb = require('./Common_pb.js');
var Downstream_pb = require('./Downstream_pb.js');

function serialize_ApplicationInstance(arg) {
  if (!(arg instanceof DiscoveryService_pb.ApplicationInstance)) {
    throw new Error('Expected argument of type ApplicationInstance');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ApplicationInstance(buffer_arg) {
  return DiscoveryService_pb.ApplicationInstance.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ApplicationInstanceHeartbeat(arg) {
  if (!(arg instanceof DiscoveryService_pb.ApplicationInstanceHeartbeat)) {
    throw new Error('Expected argument of type ApplicationInstanceHeartbeat');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ApplicationInstanceHeartbeat(buffer_arg) {
  return DiscoveryService_pb.ApplicationInstanceHeartbeat.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ApplicationInstanceMapping(arg) {
  if (!(arg instanceof DiscoveryService_pb.ApplicationInstanceMapping)) {
    throw new Error('Expected argument of type ApplicationInstanceMapping');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ApplicationInstanceMapping(buffer_arg) {
  return DiscoveryService_pb.ApplicationInstanceMapping.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Downstream(arg) {
  if (!(arg instanceof Downstream_pb.Downstream)) {
    throw new Error('Expected argument of type Downstream');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_Downstream(buffer_arg) {
  return Downstream_pb.Downstream.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ServiceNameCollection(arg) {
  if (!(arg instanceof DiscoveryService_pb.ServiceNameCollection)) {
    throw new Error('Expected argument of type ServiceNameCollection');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ServiceNameCollection(buffer_arg) {
  return DiscoveryService_pb.ServiceNameCollection.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_ServiceNameMappingCollection(arg) {
  if (!(arg instanceof DiscoveryService_pb.ServiceNameMappingCollection)) {
    throw new Error('Expected argument of type ServiceNameMappingCollection');
  }
  return new Buffer(arg.serializeBinary());
}

function deserialize_ServiceNameMappingCollection(buffer_arg) {
  return DiscoveryService_pb.ServiceNameMappingCollection.deserializeBinary(new Uint8Array(buffer_arg));
}


var InstanceDiscoveryServiceService = exports.InstanceDiscoveryServiceService = {
  registerInstance: {
    path: '/InstanceDiscoveryService/registerInstance',
    requestStream: false,
    responseStream: false,
    requestType: DiscoveryService_pb.ApplicationInstance,
    responseType: DiscoveryService_pb.ApplicationInstanceMapping,
    requestSerialize: serialize_ApplicationInstance,
    requestDeserialize: deserialize_ApplicationInstance,
    responseSerialize: serialize_ApplicationInstanceMapping,
    responseDeserialize: deserialize_ApplicationInstanceMapping,
  },
  heartbeat: {
    path: '/InstanceDiscoveryService/heartbeat',
    requestStream: false,
    responseStream: false,
    requestType: DiscoveryService_pb.ApplicationInstanceHeartbeat,
    responseType: Downstream_pb.Downstream,
    requestSerialize: serialize_ApplicationInstanceHeartbeat,
    requestDeserialize: deserialize_ApplicationInstanceHeartbeat,
    responseSerialize: serialize_Downstream,
    responseDeserialize: deserialize_Downstream,
  },
};

exports.InstanceDiscoveryServiceClient = grpc.makeGenericClientConstructor(InstanceDiscoveryServiceService);
// discovery service for ServiceName by Network address or application code
var ServiceNameDiscoveryServiceService = exports.ServiceNameDiscoveryServiceService = {
  discovery: {
    path: '/ServiceNameDiscoveryService/discovery',
    requestStream: false,
    responseStream: false,
    requestType: DiscoveryService_pb.ServiceNameCollection,
    responseType: DiscoveryService_pb.ServiceNameMappingCollection,
    requestSerialize: serialize_ServiceNameCollection,
    requestDeserialize: deserialize_ServiceNameCollection,
    responseSerialize: serialize_ServiceNameMappingCollection,
    responseDeserialize: deserialize_ServiceNameMappingCollection,
  },
};

exports.ServiceNameDiscoveryServiceClient = grpc.makeGenericClientConstructor(ServiceNameDiscoveryServiceService);
