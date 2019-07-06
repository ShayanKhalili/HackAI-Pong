const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let player1 = null;
let gameSocket = null;
let gameUpdateFunction = null;

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});

let game = io.of('/game');
game.on('connection', function(socket) {
        console.log('game connection established');
        gameSocket = socket;
        socket.on('request moves', function(gameData, fn){
            if(player1 != null) {
                player1.emit('request move', gameData);
                gameUpdateFunction = fn;
            }
        })
    });

let players = io.of('/player');
players.on('connection', function(socket){
    console.log('a user connected');
    if (player1 === null){
        player1 = socket;
        gameSocket.emit('force game loop');
    }
    socket.on('move', function(data){
        gameUpdateFunction(data);
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        if (socket === player1) {
            player1 = null;
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});