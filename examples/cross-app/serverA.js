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
require('skywalking-nodejs').start({
    applicationCode: 'test'
});

var http = require('http');
const port = 3001

callback = function (response) {
    var str = ''
    response.on('data', function (chunk) {
        str += chunk;
    });

    response.on('end', function () {
        console.log(str);
    });
}

const requestHandler = (request, response) => {
    var options = {
        host: 'localhost',
        path: '/' + 1,
        port: '3000',
        headers: {'custom': 'Custom Header Demo works'}
    };
    var req = http.request(options, callback);
    req.end();

    response.end("success");
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})
