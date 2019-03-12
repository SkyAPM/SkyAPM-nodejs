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

const Logger = function() {
    let _debug = require("debug");
    let _debugLogger = _debug("skyapm:debug");
    let _infoLogger = _debug("skyapm:info");
    let _warnLogger = _debug("skyapm:warn");
    let _errorLogger = _debug("skyapm:error");

    this.debug = function(className, format, ...args) {
        _debugLogger("[%s] " + format, className, ...args);
    };

    this.info = function(className, format, ...args) {
        _infoLogger("[%s] " + format, className, ...args);
    };

    this.warn = function(className, format, ...args) {
        _warnLogger("[%s] " + format, className, ...args);
    };

    this.error = function(className, format, ...args) {
        _errorLogger("[%s] " + format, className, ...args);
    };
};

Logger.instance = null;

Logger.getInstance = function() {
    if (this.instance === null) {
        this.instance = new Logger();
    }
    return this.instance;
};

module.exports = Logger.getInstance();
