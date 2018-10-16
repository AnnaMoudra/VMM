const express = require('express');
const http = require('http');
const socket = require('socket.io');

/*
Application setup
        web appliction files in file sqweb
*/

var app = express();

app.use(express.static(__dirname + '/sqweb'));

/*
Server setup
       listening for connection on port 8080
 */
var server = http.createServer(app).listen(8080, '0.0.0.0');

/*
Client setup

 */

var client = socket(server);
clietn.sockets.on('connection', clientConnection);

function clientConnection(socket){
    console.log('New browser instance');
    socket.on('runClassifiaction',Classification);
}

function Classification(data) {
    //todo
}

