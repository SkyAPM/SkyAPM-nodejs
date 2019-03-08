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

module.exports = HashSet;
const Utils = require("./");

/**
 * @constructor
 * @author zhang xin
 */
function HashSet() {
    this._data = [];
}

HashSet.prototype.add = function(data) {
    let that = this;
    this._data.forEach(function(item, index) {
        if (Utils.compare(item, data)) {
            that._data.splice(index, 1);
        }
    });

    this._data.push(data);
};

HashSet.prototype.indexOf = function(data) {
    let matchItem = undefined;
    this._data.forEach(function(item, index) {
        if (Utils.compare(item, data)) {
            matchItem = item;
            return;
        }
    });
    return matchItem;
};

HashSet.prototype.index = function(data) {
    let matchIndex = -1;
    this._data.forEach(function(item, index) {
        if (Utils.compare(item, data)) {
            matchIndex = index;
            return;
        }
    });
    return matchIndex;
};

HashSet.prototype.contain = function(data) {
    return this.indexOf(data) != undefined;
};

HashSet.prototype.remove = function(data) {
    let index = this.index(data);
    if (index == -1) {
        return false;
    }

    this._data.splice(index, 1);
    return true;
};

HashSet.prototype.forEach = function(callback) {
    this._data.forEach(function(item, index) {
        callback(item, index);
    });
};

HashSet.prototype.size = function() {
    return this._data.length;
};

