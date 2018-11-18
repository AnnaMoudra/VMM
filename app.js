const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fetch = require('node-fetch');
const b64 = require('base-64');
const fs = require('fs');
var Blob = require('blob');

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
function Client(id, socket){
    this.id = id;
    this.socket = socket;
    this.annotation = {
        time: "",
        name: "",
        sqm: 0
    };
}

var client = socketIO(server);
client.sockets.on('connection', clientConnection);
var clients = [];


/*
* new App instance
*/
function clientConnection(socket){
    console.log('New browser instance');
    id = Math.floor(Math.random()*1000);
    cl = new Client(id, socket)
    id_data = {
        Id: id
    }
    clients[id] = client;
    socket.emit('generatedId', id_data);
    socket.on('getInfo',getInfo);
    socket.on('getImage',getImg);
    socket.on('runClassification', Classification);
}

/*
*
* Save image annotation
*
*/
function getInfo(data) {
    var id = data.id;
    clients[id].annotation.name = data.name;
    clients[id].annotation.time = data.date;
    clients[id].annotation.sqm = parseInt(data.sqm);
}

/*
*
* Save image to file and emit permission to start classification.
*
*/
function getImg(data) {
    var id = data.id;
    console.log("Img received");
    var base64Data = data.image.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFile('./temp/in_image'+id+'.jpg', base64Data, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });

    console.log('saving ended');
    clients[id].socket.emit('goodToClass', true);
}


function Classification(data) {
    //todo
    //load image
    //classify in module
    //save to library
    //send results to client
}

