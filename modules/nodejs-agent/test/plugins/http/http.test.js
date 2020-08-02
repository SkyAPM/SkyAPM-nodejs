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


const axios = require("axios");
const assert = require("assert");
const path = require("path");
const yaml = require("yaml");
const fs = require("fs");
const wait = require("wait-until");
const {setUp, tearDown} = require("../../common");

const composeFile = path.resolve(__dirname, "docker-compose.yml");
const expectedFile = path.resolve(__dirname, "expected.data.yml");

describe("PluginTests", function() {
    before(function() {
        this.timeout(600000);

        return setUp(composeFile, (ready) => {
            axios.get("http://127.0.0.1:3001/test")
                .then((res) => ready(res.status === 200))
                .catch(() => ready(false));
        });
    });

    after(function() {
        this.timeout(120000);

        return tearDown(composeFile);
    });

    it("plugin test for http", function(done) {
        this.timeout(30000);

        wait()
            .times(10)
            .interval(3000)
            .condition((cb) => {
                axios.get("http://127.0.0.1:12800/receiveData").then((res) => {
                    cb(yaml.parse(res.data).segmentItems.length === 2);
                }).catch(() => cb(false));
            })
            .done((result) => {
                if (!result) {
                    assert.fail("Received data is empty");
                }
                const content = fs.readFileSync(expectedFile, {encoding: "utf8", flag: "r"});
                axios.post("http://127.0.0.1:12800/dataValidate", content).then((response) => {
                    if (response.status === 200) {
                        done();
                    } else {
                        done(new Error("Verification failed"));
                    }
                }).catch((err) => done(err));
            });
    });
});
