const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let connections = [];
let gameSocket = null;

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});

var game = io
    .of('/game')
    .on('connection', function(socket) {
        console.log('game connection established');
        gameSocket = socket;
        socket.on('request moves', function(gameData){
            if(connections.length > 0) {
                console.log('this works');
                connections[0].emit('send move', gameData);
            }
        })
    });

var players = io
    .of('/player')
    .on('connection', function(socket){
    console.log('a user connected');
    connections.push(socket);
    socket.on('move player', function(data){
        gameSocket.emit('player move', data);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        for (var i = 0; i < connections.length; i++) {
            if (connections[i] === socket) {
                connections.splice(i, 1);
                break;
            }
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});