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

module.exports = ID;

const AgentConfig = require("../config");
const process = require("process");
const randomize = require("randomatic");

/**
 * @param {idParts} idParts
 * @constructor
 * @author zhang xin
 */
function ID(idParts) {
    if (idParts) {
        this._part1 = idParts.part1;
        this._part2 = idParts.part2;
        this._part3 = idParts.part3;
    } else {
        this._part1 = AgentConfig.getInstanceId();
        this._part2 = (process.pid * process.ppid ? process.ppid : (((1 + Math.random()) * 0x10000) | 0)
            + (((1 + Math.random()) * 0x10000) | 0)) + Number(randomize("0", 5));
        this._part3 = Number(process.hrtime().join("")) + Number(randomize("0", 9));
    }
}

ID.prototype.toString = function() {
    return this._part1 + "." + this._part2 + "." + this._part3;
};

ID.prototype.encode = function() {
    return this.toString();
};

ID.prototype.part1 = function() {
    return this._part1;
};

ID.prototype.part2 = function() {
    return this._part2;
};

ID.prototype.part3 = function() {
    return this._part3;
};
