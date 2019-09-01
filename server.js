const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let player1 = null;
let player2 = null;
let gameSocket = null;
let moves = {
    p1: null,
    p2: null
}
let movesTimeout = null;

app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});

function cancelMoveRequest() {
    if (moves.p1 === null) player1.emit('cancel move');
    if (moves.p2 === null) player2.emit('cancel move');
    if (gameSocket != null) gameSocket.emit('update', moves);
    moves.p1 = null;
    moves.p2 = null;
}

let gameNamespace = io.of('/game');
gameNamespace.on('connection', function(socket) {
        console.log('game connection established');
        gameSocket = socket;
        socket.on('request moves', function(gameData){
            if(player1 != null && player2 != null) {
                player1.emit('request move', gameData);
                player2.emit('request move', gameData);
                movesTimeout = setTimeout(cancelMoveRequest, 200);
            }
        });

        socket.on('disconnect', function(){
            gameSocket = null;
        });

        // if (player1 != null && player2 != null) {
        //     gameSocket.emit('force game loop');
        // }
    });

let playerNamespace = io.of('/player');
playerNamespace.on('connection', function(socket){
    console.log('a user connected');
    if (player1 === null) {
        player1 = socket;
        if (player2 != null && gameSocket != null) {
            gameSocket.emit('force game loop');
        }
    } else if (player2 === null) {
        player2 = socket;
        if (player1 != null && gameSocket != null) {
            gameSocket.emit('force game loop');
        }
    }

    socket.on('move', function(data){
        moves[data.player] = data.direction;
        console.log(moves);
        if (moves.p1 != null && moves.p2 != null) {
            if (gameSocket != null) gameSocket.emit('update', moves);
            clearTimeout(movesTimeout);
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