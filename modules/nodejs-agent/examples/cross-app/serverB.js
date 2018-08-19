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
    applicationCode: 'test1'
});

const http = require('http')
var mysql = require('mysql');
const port = 3000

const requestHandler = (request, response) => {
    var connection = mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: 'root',
        database: 'test'
    });

    connection.connect();

    connection.query('SELECT SLEEP(1)', function (error, results, fields) {
        if (error) throw error;

        connection = mysql.createConnection({
            host: 'localhost',
            port: 3307,
            user: 'root',
            password: 'root',
            database: 'test'
        });

        connection.connect();

        connection.query('SELECT SLEEP(3)', function (error, results, fields) {
            if (error) throw error;
        });
    });

    connection.query('SELECT SLEEP(2)', function (error, results, fields) {
        if (error) throw error;
    });

    response.end("test");
}

const serverB = http.createServer(requestHandler)

serverB.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }
    console.log(`server is listening on ${port}`)
})

