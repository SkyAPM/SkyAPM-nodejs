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
const resolve = require("resolve");
const path = require("path");

module.exports = hook;

/**
 *
 * @param {modules} modules
 * @param {requireCallback} requireCallback
 * @author zhang xin
 */
function hook(modules, requireCallback) {
    const enhancedModuleCache = {};
    const _origRequire = Module.prototype.require;
    Module.prototype.require = function(request) {
        let filename = Module._resolveFilename(request, this);
        let core = filename.indexOf(path.sep) === -1;
        let moduleName = "";
        let matchModuleName = "";
        let enhanceFile = "";
        let version = "";

        if (enhancedModuleCache.hasOwnProperty(filename)) {
            return enhancedModuleCache[filename];
        }

        let exports = _origRequire.apply(this, arguments);
        if (core) {
            moduleName = filename;
            matchModuleName = filename;
            enhanceFile = filename;
        } else {
            let pathSegment = filename.split(path.sep);
            let index = pathSegment.lastIndexOf("node_modules");
            const isWithScope = pathSegment[index + 1][0] === "@";
            moduleName = isWithScope ?
                pathSegment[index + 1] + "/" + pathSegment[index + 2] :
                pathSegment[index + 1];
            let basedir = pathSegment.slice(0, index + (isWithScope ? 3 : 2)).join(path.sep);
            try {
                let res = resolve.sync(moduleName, {basedir: basedir});
                if (res !== filename) {
                    enhanceFile = pathSegment[pathSegment.length - 1].split(".")[0];
                    matchModuleName = moduleName + ":" + pathSegment[pathSegment.length - 1];
                } else {
                    matchModuleName = moduleName;
                    moduleName = moduleName;
                    enhanceFile = moduleName;
                }
            } catch (e) {
                return exports;
            }
        }

        if (modules && modules.indexOf(matchModuleName) === -1) return exports;
        if (!enhancedModuleCache.hasOwnProperty(filename)) {
            enhancedModuleCache[filename] = exports;
            enhancedModuleCache[filename] = requireCallback(exports, moduleName, version, enhanceFile);
        }

        return enhancedModuleCache[filename];
    };
};
