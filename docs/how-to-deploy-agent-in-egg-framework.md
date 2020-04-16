# How to deploy agent in egg framework

## Install `skyapm-egg-require` module
1. goto project 
2. run the following command
```shell
$ npm install skyapm-egg-require --save
```

## Deploy Skywalking backend
Skywalking provide two deploy mode, one is standalone mode and the other is cluster mode, and here is the deploy documents.
* [Local mode](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Deploy-backend-in-standalone-mode.md)
* [Cluster mode](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Deploy-backend-in-cluster-mode.md)

## Modify start script
Add the following the stuff to the start script
```
--require skyapm-egg-require --sw_service_name=Your_service_name --sw_instance_name=Your_instance_name --sw_direct_Servers=Collector_remote_grpc_address
```

* `Your_service_name`: It used to differentiate between different services. the value will be shown in WebUI.
* `Your_instance_name`: It used to differentiate between different instance.
* `Collector_agent_grpc_address`: This value should be consistent with the `agent_gRPC.gRPC` configuration items in the application.yml in the Collector project. (default value: localhost:11800)


## Visit your application
After you do all above actions and your application has been monitored. you can visit your service that your application provided and the tracking data will be reported to the Skywalking backend.

## Visit skywalking webui
If you has start up UI, you maybe can open browser and visit the webui url. The url by default is [http://localhost:8080](http://localhost:8080), If you has changed `server.port` configuration about webui, the visit url has change to http://localhost:[server.port]. If you haven't started yet, don't worry about the loss data problem and Skywalking will keep your data safe, just start up UI, and visit the webui url.

