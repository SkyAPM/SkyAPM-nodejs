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

let Tags = function() {
    this.DB_TYPE = new Tag("db.type");
    this.DB_INSTANCE = new Tag("db.instance");
    this.DB_STATEMENT = new Tag("db.statement");
};

let Tag = function(key) {
    this._key = key;

    this.tag = function(span, value) {
        span.tag.apply(span, [this._key, value]);
    };
};


Tags.instance = null;

Tags.getInstance = function() {
    if (this.instance === null) {
        this.instance = new Tags();
    }
    return this.instance;
};

module.exports = Tags.getInstance();
