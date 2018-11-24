const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs');
const cv = require('opencv4nodejs');



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
    var new_id = Math.floor(Math.random()*1000);
    var cl = new Client(new_id, socket);
    var id_data = {
        id: new_id
    };
    clients[new_id] = cl;
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
    clients.forEach(
        function (client) {
            if(client.id == id){
                console.log('info cl ID:', client.id);
                client.annotation.name = data.name;
                client.annotation.time = data.date;
                client.annotation.sqm = parseInt(data.sqm);
            }
        });

}

/*
*
* Save image to file and emit permission to start classification.
*
*/
function getImg(data) {
    var id = data.id;
    console.log("Img received, ID: ", data.id);
    var base64Data = data.image.replace(/^data:image\/jpeg;base64,/, "");
    fs.writeFile('./../temp/in_image'+id+'.jpg', base64Data, {encoding: 'base64'}, function(err) {
        console.log('File created');
    });
    clients.forEach(
        function (client) {
            if(client.id == id){
                console.log('cl ID:', client.id);
                client.socket.emit('goodToClass', true);
            }
        });

}


function Classification(data) {
    var id = data.id;
    var cl;
    clients.forEach(
        function (client) {
            if(client.id == id){
                console.log('cl ID:', client.id);
                cl = client;
            }
        });
    //relative path to image from 'my_libs'
    var img_path = './../temp/in_image'+id+'.jpg'
    var an = cl.annotation;
    //classify in module

    const image = cv.imread(img_path);
    var results = classifier.run(image, an);
    //save to library
    //TODO
    //erase from temp
    var path = './../temp/in_image'+id+'.jpg'
    //TODO
    //send results to client
    //TODO
    cl.socket.emit('results');

}

