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

module.exports = NoopSpan;

/**
 *
 * @param {traceContext} traceContext
 * @constructor
 * @author zhang xin
 */
function NoopSpan(traceContext) {
    this._traceContext = traceContext;
}

NoopSpan.prototype.start = function() {

};

NoopSpan.prototype.finish = function() {
};

NoopSpan.prototype.traceContext = function() {
    return this._traceContext;
};


NoopSpan.prototype.isEntrySpan = function() {
    return false;
};

NoopSpan.prototype.isExitSpan = function() {
    return false;
};

NoopSpan.prototype.isLocalSpan = function() {
    return false;
};

NoopSpan.prototype.tag = function(key, value) {
};

NoopSpan.prototype.log = function(err) {
};

NoopSpan.prototype.ref = function(traceSegmentRef) {
};

NoopSpan.prototype.getSpanId = function() {
    return -1;
};

NoopSpan.prototype.fetchPeerInfo = function(
    registerCallback, unregisterCallback) {

};

NoopSpan.prototype.errorOccurred = function() {
};

NoopSpan.prototype.fetchOperationNameInfo = function(
    registerCallback, unregisterCallback) {

};

NoopSpan.prototype.component = function(component) {

};

NoopSpan.prototype.spanLayer = function(spanLayer) {

};
