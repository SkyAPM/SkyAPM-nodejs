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

/**
 *
 * @constructor
 * @author zhang xin
 */
function TraceSegmentCachePool() {
    this._bucket = [];
    this._bucketSize = Number.isSafeInteger(256);
    this._timeout = undefined;
    this._consumer = undefined;
    this._flushInterval = 1000;
};

TraceSegmentCachePool.prototype.put = function(traceSegment) {
    this._bucket.push(traceSegment);
    if (this._bucketSize !== -1 && this._bucket.length >= this._bucketSize) {
        this.consumeData();
    } else if (!this._timeout) {
        this.scheduleConsumeData();
    }
};

TraceSegmentCachePool.prototype.consumeData = function() {
    if (this._bucket.length != 0) {
        this._consumer(this._bucket);
    }
    this._clear();
};

TraceSegmentCachePool.prototype.scheduleConsumeData = function() {
    let self = this;
    this._timeout = setTimeout(function() {
        self.consumeData();
    }, this._flushInterval);
    this._timeout.unref();
};

TraceSegmentCachePool.prototype._clear = function() {
    clearTimeout(this._timeout);
    this._bucket = [];
    this._timeout = undefined;
};

TraceSegmentCachePool.prototype.registerConsumer = function(consumer) {
    this._consumer = consumer;
};


module.exports = exports = new TraceSegmentCachePool();
