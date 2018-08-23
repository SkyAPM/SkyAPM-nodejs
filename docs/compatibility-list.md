# Capatibility list
In Skywalking, each monitored component/framework will have a unique identifier. because of the publish time and publish version for the Skywalking main project and nodejs project is not one by one corresponding. So some monitored component/framework identifier are not recognized by the Skywalking Collector, it will cause some problems on the UI.

So you have two way to resolve this problem. One is download the capatiblity version and the other way is [add your own component library setting in Skywalking Collector](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Component-libraries-extend.md)

## Capatility table

| Nodejs agent version| Skywalking backend version|
|:------|:----|
| 0.1.x | 5.0.0-beta |
| 0.3.0 | 5.0.0-RC (not release) |
