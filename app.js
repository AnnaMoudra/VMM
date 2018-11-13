const express = require('express');
const http = require('http');
const socket = require('socket.io');
const fetch = require('node-fetch');
const Bluebird = require('bluebird');

fetch.Promise = Bluebird;

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
    socket.on('getImage',getImg);
}

//client confirmed
function getInfo(data) {
    //receive anotations

    //socket.on('getImage',getImg);
}

function urltoFile(url, filename, mimeType){
    mimeType = mimeType || (url.match(/^data:([^;]+);/)||'')[1];
    return (fetch(url)
            .then(function(res){return res.arrayBuffer();})
            .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
}


//receive image
function getImg(data) {

    console.log("Img received");

    console.log(data.image);
    // save to temp



//Usage example:
    //urltoFile(data.image, 'a.png').then(function(file){console.log(file);})
    //run classification

    // save to db and remove from temp
}


function Classification(image) {
    //todo

    //load library


    //classify

    //save to library

    //send results to client
}

