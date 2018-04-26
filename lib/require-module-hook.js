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

"use strict";

const Module = require("module");
const path = require("path");
const originLoad = Module._load;
const debug = require("debug")("skywalking-hook");
const error = debug("skywalking-hook:error");

/**
 *
 * @param {modules} modules
 * @param {requireCallback} requireCallback
 * @author zhang xin
 */
module.exports = function hook(modules, requireCallback) {
  hook.enhancedModuleCache = {};

  Module._load = function(request, parent, isMain) {
    let exports = originLoad.apply(Module, arguments);

    if (modules.indexOf(request) == -1) {
      debug("Module[%s] not in the enhance list. skip it.", request);
      return exports;
    }

    try {
      let moduleFullPath = Module._resolveFilename(request, parent);
      let pathSegment = moduleFullPath.split(path.sep);
      let index = pathSegment.lastIndexOf("node_modules");
      let modulePackageBaseDir = pathSegment.slice(0, index + 2).join(path.sep);
      let version = (index == -1) ?
          undefined :
          require(modulePackageBaseDir + path.sep + "package.json").version;

      if (!hook.enhancedModuleCache.hasOwnProperty(request)) {
        hook.enhancedModuleCache[request] = requireCallback(exports, request,
            version);
      }

      return hook.enhancedModuleCache[request];
    } catch (e) {
      error("Failed to enhance module[%s]. error message: %s", request,
          e.description);
      return exports;
    }
  };
};
