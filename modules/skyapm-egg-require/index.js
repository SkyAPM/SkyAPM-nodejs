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

const argString = process.argv.slice(2);
const args = JSON.parse(argString && argString.length > 0 ? argString : "{}");
let serviceName;
let directServers;
let authentication;
if (args.hasOwnProperty("sw_service_name")) {
    serviceName = args["sw_service_name"];
}

if (args.hasOwnProperty("sw_direct_Servers")) {
    directServers = args["sw_direct_Servers"];
}

if (args.hasOwnProperty("sw_authentication")) {
    authentication = args["sw_authentication"];
}

require("skyapm-nodejs").start({
    serviceName,
    directServers,
    authentication,
});
