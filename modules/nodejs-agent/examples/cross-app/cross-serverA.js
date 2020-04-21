require("skyapm-nodejs").start({
    serviceName: 'testA',
    instanceName: 'testA',
    directServers: 'localhost:11800'
});

let http = require('http');
let server = http.createServer(function (req, res) {   //create web server
    const options = {
        hostname: 'localhost',
        port: 5002,
        path: '/serverB',
        method: 'GET'
    }

    const newReq = http.request(options, newRes => {
        console.log(`statusCode: ${res.statusCode}`)
        newRes.on('data', d => {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(d);
            res.end();
        })
    })

    newReq.on('error', error => {
        throw error
    })

    newReq.end()

});

server.listen(5001);
console.log('Node.js web server at port 5000 is running..')
