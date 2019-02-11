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

module.exports = Plugin;

/**
 *
 * @param {name} name
 * @param {moduleName} moduleName
 * @param {enhanceVersions} enhanceVersions
 * @constructor
 * @author zhang xin
 */
function Plugin(name, moduleName, enhanceVersions) {
    this._name = name;
    this._moduleName = moduleName;
    this._enhanceVersions = enhanceVersions;
}

Plugin.prototype.getName = function() {
    return this._name;
};

Plugin.prototype.attemptToFindInterceptor = function(version, enhanceFile) {
    let interceptor = undefined;
    this._enhanceVersions.forEach(function(enhanceVersion) {
        if (enhanceVersion.canEnhance(version, enhanceFile)) {
            interceptor = enhanceVersion.getInterceptor(enhanceFile);
            return;
        }
    });

    return interceptor;
};

Plugin.prototype.getModuleName = function() {
    return this._moduleName;
};
