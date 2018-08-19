/*
 * Licensed to the OpenSkywalking under one or more
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

const logger = require("../logger");

let TraceSegmentCachePool = function() {
  let _bucket = [];
  let _bucketSize = Number.isSafeInteger(256);
  let _timeout = undefined;
  let _consumer = undefined;
  let _flushInterval = 1000;

  this.put = function(traceSegment) {
    logger.debug("trace-segment-cache-pool", "put new TraceSegment");
    _bucket.push(traceSegment);
    if (_bucketSize !== -1 && _bucket.length >= _bucketSize) {
      this.consumeData();
    } else if (!this._timeout) {
      this.scheduleConsumeData();
    }
  };

  this.consumeData = function() {
    logger.debug("trace-segment-cache-pool", "consumer {} TraceSegments.", _bucket.length);
    if (_bucket.length != 0) {
      _consumer(_bucket);
    }

    this._clear();
  };

  this.scheduleConsumeData = function() {
    let self = this;
    _timeout = setTimeout(function() {
      self.consumeData();
    }, _flushInterval);
    _timeout.unref();
  };

  this._clear = function() {
    clearTimeout(_timeout);
    _bucket = [];
    _timeout = undefined;
  };

  this.registerConsumer = function(consumer) {
    _consumer = consumer;
  };
};

TraceSegmentCachePool.instance = null;

TraceSegmentCachePool.getInstance = function() {
  if (this.instance === null) {
    this.instance = new TraceSegmentCachePool();
  }
  return this.instance;
};

module.exports = TraceSegmentCachePool.getInstance();
