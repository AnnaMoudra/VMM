const express = require('express');
const http = require('http');
const socket = require('socket.io');

const classifier = require('./my_libs/classificator.js');

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
client.sockets.on('connection', clientConnection);

function clientConnection(socket){
    console.log('New browser instance');
    socket.on('getInfo',getInfo);
}

//client confirmed
function getInfo(data) {
    //receive anotations

    socket.on('getImage',getImg);
}

//receive image
function getImg(data) {


    //run classification
}


function Classification(image) {
    //todo

    //load library


    //classify

    //save to library

    //send results to client
}

