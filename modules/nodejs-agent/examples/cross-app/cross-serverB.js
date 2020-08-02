require("skyapm-nodejs").start({
    serviceName: 'testB',
    instanceName: 'testB',
    directServers: 'localhost:11800'
});

let http = require('http');
let mysql = require("mysql");

let server = http.createServer(function (req, res) {   //create web server
    let connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: "root1234",
        database: "test_database",
    });

    connection.connect();

    connection.query("SELECT SLEEP(1)", function (error, results, fields) {
        if (error) throw error;
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<html><body><p>This is student Page.</p></body></html>');
        res.end();
    });
});

server.listen(5002);
console.log('Node.js web server at port 5000 is running..')
