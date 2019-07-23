const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let player1 = null;
let player2 = null;
let gameSocket = null;
let gameUpdateFunction = null;
let moves = {
    p1: null,
    p2: null
}

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});

let game = io.of('/game');
game.on('connection', function(socket) {
        console.log('game connection established');
        gameSocket = socket;
        socket.on('request moves', function(gameData, fn){
            if(player1 != null && player2 != null) {
                player1.emit('request move', gameData);
                player2.emit('request move', gameData);
                gameUpdateFunction = fn;
            }
        });

        if (player1 != null && player2 != null) {
            gameSocket.emit('force game loop');
        }
    });

let players = io.of('/player');
players.on('connection', function(socket){
    console.log('a user connected');
    if (player1 === null) {
        player1 = socket;
    } else if (player2 === null) {
        player2 = socket;
    }

    socket.on('move', function(direction, player){
        moves[player] = direction;
        console.log(moves);
        if (moves.p1 != null && moves.p2 != null) {
            gameUpdateFunction(moves.p1, moves.p2);
            moves.p1 = null;
            moves.p2 = null;
        }
    });
    socket.on('disconnect', function(){
        console.log('user disconnected');
        if (socket === player1) {
            player1 = null;
        } else {
            player2 = null;
        }
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});