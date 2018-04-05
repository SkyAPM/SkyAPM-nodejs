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

require('skywalking-nodejs').start();

for (var i = 0; i < 3; i++) {
    var mysql = require('mysql');
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
        console.log("success");
    });
}