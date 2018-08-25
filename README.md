# SkyWalking Node.js

<img src="https://skywalkingtest.github.io/page-resources/3.0/skywalking.png" alt="Sky Walking logo" height="90px" align="right" />

SkyWalking Node.js is the Node.js instrumentation agent, which is compatible with [Apache SkyWalking(Incubating) APM](https://github.com/apache/incubator-skywalking) backend and others compatible agents/SDKs.

[![Build Status](https://travis-ci.org/OpenSkywalking/skywalking-nodejs.svg?branch=master)](https://travis-ci.org/OpenSkywalking/skywalking-nodejs)

## Quick Start

Before you do this. you should make sure the Skywalking backben has been installed. Please read the these documents.
* [Deploy skywalking backend in standalone mode](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Deploy-backend-in-standalone-mode.md)
* [Deploy skywalking backend in cluster mode](https://github.com/apache/incubator-skywalking/blob/master/docs/en/Deploy-backend-in-cluster-mode.md)

### Installation
Add the skywalking-nodejs module as a dependency to your application:
> npm install skywalking-nodejs@latest --save

### Initialization
It’s important that the agent is started before you require any other modules in your Node.js application. and you should
require and start the agent in your application’s main file.

```javascript
require('skywalking-nodejs').start({
    // Application code is showed in sky-walking-ui. Suggestion: set an unique name for each application, one
    // application's nodes share the same code.
    // this value cannot be empty.
    applicationCode: 'test',
    // Collector agent_gRPC/grpc service addresses.
    // default value: localhost:11800
    directServers: 'localhost:11800'
});
```

### Reboot application
After Reboot your application and now your application has been monitored.


## Documents
* [Document in English](docs/README.md)

## Support List
1. [Http](https://nodejs.org/api/http.html)
2. [Mysql](https://github.com/mysqljs/mysql)
3. [Egg](https://github.com/eggjs/egg)


# Contact Us
* Submit an issue
* Mail list: dev@skywalking.apache.org
* [Gitter](https://gitter.im/openskywalking/Lobby)
* QQ Group: 392443393

## License
[Apache 2.0](LICENSE.md)
