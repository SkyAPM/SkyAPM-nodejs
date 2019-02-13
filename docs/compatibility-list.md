# Capatibility list
In Skywalking, each monitored component/framework will have a unique identifier. because of the publish time and publish version for the Skywalking main project and nodejs project is not one by one corresponding. So some monitored component/framework identifier are not recognized by the Skywalking Collector, it will cause some problems on the UI.

So you have two way to resolve this problem. One is **download the capatiblity version** and the other way is **add your own component library setting**.

## Download the capatiblity version

| Nodejs agent version| Skywalking backend version|
|:------|:----|
| 0.1.x | 5.0.0-beta |
| 0.3.0 | 5.0.0-RC |
| 1.0.0 | 6.0.0-GA |


## Add your own component library
If you don't want to upgrade the Skywalking backend, No problem, Skywalking provide another simple way to resolve it, Just following [this document](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Component-libraries-extend.md) to add your own component libray setting.

Here is the plugin support mapping.

|Component ID | Plugin Name | Release version | Backend support version|
|:-----|:------|:-----|:-----|
| 2 | Http | 0.1.2 | 5.0.0-beta|
| 5 | Mysql | 0.1.2 | 5.0.0-beta|
| 4003 | Egg | 0.3.0 | 5.0.0-RC |
