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

'use strict'

var Module = require('module');
var path = require('path');
var origin_load = Module._load;
var debug = require('debug')('skywalking-hook')
var error = debug('skywalking-hook:error');

/**
 * @author zhang xin
 */
module.exports = function hook(modules, requireCallback) {
    hook.enhancedModuleCache = {};

    Module._load = function (request, parent, isMain) {
        var exports = origin_load.apply(Module, arguments);

        if (modules.indexOf(request) == -1) {
            debug("Module[%s] not in the enhance list. skip it.", request);
            return exports;
        }

        try {
            var moduleFullPath = Module._resolveFilename(request, parent);
            var pathSegment = moduleFullPath.split(path.sep);
            var index = pathSegment.lastIndexOf('node_modules')
            var modulePackageBaseDir = pathSegment.slice(0, index + 2).join(path.sep);
            var version = (index == -1) ? undefined : require(modulePackageBaseDir + path.sep + "package.json").version;

            if (!hook.enhancedModuleCache.hasOwnProperty(request)) {
                hook.enhancedModuleCache[request] = requireCallback(exports, request, version)
            }

            return hook.enhancedModuleCache[request]
        } catch (e) {
            error("Failed to enhance module[%s]. error message: %s", request, e.description);
            return exports;
        }
    };
}