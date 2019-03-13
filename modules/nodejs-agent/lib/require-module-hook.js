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

const Module = require("module");
const resolve = require("resolve");
const path = require("path");
const fs = require("fs");

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
    let progressingHookFiles = {};
    Module.prototype.require = function(request) {
        let filename = Module._resolveFilename(request, this);
        let core = filename.indexOf(path.sep) === -1;
        let moduleName = "";
        let enhanceFile = undefined;
        let version = undefined;
        let basedir = undefined;

        if (enhancedModuleCache.hasOwnProperty(filename)) {
            return enhancedModuleCache[filename];
        }

        // check current module is in progressing,
        // if yes, ignore it
        let progressing = progressingHookFiles[filename];
        if (!progressing) {
            progressingHookFiles[filename] = true;
        }

        let exports = _origRequire.apply(this, arguments);
        if (progressing) return exports;
        delete progressingHookFiles[filename];

        if (core) {
            moduleName = filename;
            enhanceFile = filename;
        } else {
            let pathSegment = filename.split(path.sep);
            let index = pathSegment.lastIndexOf("node_modules");
            const isWithScope = pathSegment[index + 1][0] === "@";
            moduleName = isWithScope ?
                pathSegment[index + 1] + "/" + pathSegment[index + 2] :
                pathSegment[index + 1];
            basedir = pathSegment.slice(0, index + (isWithScope ? 3 : 2)).join(path.sep);
            try {
                let res = resolve.sync(moduleName, {basedir: basedir});
                if (res !== filename) {
                    enhanceFile = pathSegment[pathSegment.length - 1].split(".")[0];
                } else {
                    enhanceFile = moduleName;
                }
            } catch (e) {
                return exports;
            }
        }

        if (modules && modules.indexOf(moduleName) === -1) return exports;

        // get version. Because of we enhance Module.prototype.require, so we can't fetch the version by execute
        // `require(basedir + path.sep + "package.json")` method
        if (basedir) {
            const packageJson = path.join(basedir, "package.json");
            try {
                version = JSON.parse(fs.readFileSync(packageJson)).version;
            } catch (e) {
            }
        }

        if (!enhancedModuleCache.hasOwnProperty(filename)) {
            enhancedModuleCache[filename] = exports;
            enhancedModuleCache[filename] = requireCallback(exports, moduleName, version, enhanceFile);
        }

        return enhancedModuleCache[filename];
    };
};
