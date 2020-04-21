# Compatibility list
In SkyWalking, each monitored component/framework will have a unique identifier. because of the publish time and publish version for the SkyWalking main project and nodejs project is not one by one corresponding. So some monitored component/framework identifier are not recognized by the SkyWalking Collector, it will cause some problems on the UI.

So you have two ways to resolve this problem. One is **download the compatible version** and the other way is **add your own component library setting**.

## Download the compatible version

| Nodejs agent version| SkyWalking backend version|
|:------|:----|
| 0.1.x | 5.0.0-beta |
| 0.3.0 | 5.0.0-RC |
| 1.0.0 | 6.0.0-GA |


## Add your own component library
If you don't want to upgrade the SkyWalking backend, no problem, SkyWalking provides another simple way to resolve it, just follow [this document](https://github.com/apache/skywalking/blob/master/docs/en/Component-libraries-extend.md) to add your own component library setting.

Here is the plugin support mapping.

|Component ID | Plugin Name | Release version | Backend support version|
|:-----|:------|:-----|:-----|
| 2 | Http | 0.1.2 | 5.0.0-beta|
| 5 | Mysql | 0.1.2 | 5.0.0-beta|
| 4003 | Egg | 0.3.0 | 5.0.0-RC |
