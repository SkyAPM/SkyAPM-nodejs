# How to deploy agent in egg framework

## Install `skywalking-egg-require` module
1. goto egg framework
2. run the following command
```shell
$ npm install skywalking-egg-require --save
```

## Deploy Skywalking collector
1. Download releases from Apache official website. [Link](http://skywalking.apache.org/downloads/)
2. Deploy backend on local. See [collector in standalone mode doc](Deploy-backend-in-standalone-mode.md)

## Modify start script
Add the following the stuff to the start script
```
--require sw-egg-script --sw_pplication_code=Your_application_code --sw_direct_Servers=Collector_remote_grpc_address
```

* `Your_application_code`: it used to differentiate between different applications. the value will be shown in WebUI.
* `Collector_agent_grpc_address`: This value should be consistent with the `agent_gRPC.gRPC` configuration items in the application.yml in the Collector project. (default value: localhost:11800)


## Visit your egg application

## Visit skywalking webui
Open the browser and visit the webui. (default url: http://localhost:8080)