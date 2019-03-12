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

module.exports = EndpointDictionary;
const async = require("async");
const logger = require("../logger");
const HashSet = require("../utils/hashset");
const hash = require("object-hash");

/**
 *
 * @author zhang xin
 */
function EndpointDictionary() {
    this._registerEndPoints = new Map();
    this._unregisterEndPoints = new HashSet();
}

EndpointDictionary.prototype.find = function(endpoint, callback) {
    let hashValue = hash(endpoint);
    if (!this._registerEndPoints.has(hashValue)) {
        this._unregisterEndPoints.add(endpoint);
        return callback("operationName", endpoint.endpointName());
    }

    return callback("operationId", this._registerEndPoints.get(hashValue));
};


EndpointDictionary.prototype.startRegisterEndPoint = function() {
    let that = this;
    async.forever(function(next) {
        setTimeout(function() {
            if (that._unregisterEndPoints.size() > 0) {
                const serviceManager = require("../services");
                serviceManager.remoteClientService().registerEndpoint(that._unregisterEndPoints, function(endPointMapping) {
                    for (let mapping of endPointMapping.entries()) {
                        logger.debug("endpoint-dictionary", "register endpoint[%s, %s].", mapping[0].endpointName(), mapping[1]);
                        that._registerEndPoints.set(hash(mapping[0]), mapping[1]);
                    }

                    endPointMapping.forEach(function(value, key) {
                        that._unregisterEndPoints.remove(key);
                    });

                    next();
                });
            } else {
                next();
            }
        }, 5 * 1000);
    }, function(err) {
        logger.error("endpoint-dictionary", "Failed to execute register endpoint task. Reason: %s", err.message);
    });
};
