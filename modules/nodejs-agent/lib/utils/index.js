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
 * @constructor
 * @author zhang xin
 */
function Utils() {

}

Utils.prototype.compare = function(x, y) {
    if (x === y) return true;
    if (!(x instanceof Object) || !(y instanceof Object)) return false;
    if (x.constructor !== y.constructor) return false;

    for (let p in x) {
        if (!x.hasOwnProperty(p)) continue;
        if (!y.hasOwnProperty(p)) return false;
        if (x[p] === y[p]) continue;
        if (typeof(x[p]) !== "object") return false;
        if (!Object.equals(x[p], y[p])) return false;
    }

    for (let p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) return false;
    }

    return true;
};


module.exports = exports = new Utils();
