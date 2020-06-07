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

require("skyapm-nodejs").start({});

const http = require("http");
const port = 3000;

const requestHandler = (request, response) => {
    response.end("test");
};

const serverB = http.createServer(requestHandler);

serverB.listen(port, (err) => {
    if (err) {
        return console.log("something bad happened", err);
    }
    console.log(`server is listening on ${port}`);
});

