var net = require('net');

var HOST = '0.0.0.0';
var PORT = 2424;
var games = {};
var boards = {};

// Create a server instance, and chain the listen function to it
// The function passed to net.createServer() becomes the event handler for the 'connection' event
// The sock object the callback function receives UNIQUE for each connection
net.createServer(function (sock){
    sock.setNoDelay(true);

    var currentgamecode = null;
    var playernumber = null;

    // We have a connection - a socket object is assigned to the connection automatically
     //console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    // Add a 'data' event handler to this instance of socket
    sock.on('data', function (data) {
        

        //console.log('DATA ' + sock.remoteAddress + ': ' + data);

        msg = data.toString('utf8').trim()
        if (msg === "GETGAMECODE") {
            gamecode = randomString(6, '0123456789abcdefghijklmnopqrstuvwxyz');
            games[gamecode] = {
                player1: {
                    socket: sock,
                    board: null
                },
                player2: {
                    socket: null,
                    board: null,
                }
            }
            // gamecodes[gamecodes.length++] = gamecode
            sock.write('GAMECODE ' + gamecode + "\n");
            currentgamecode = gamecode;
            playernumber = 1;
        }
        if (msg.includes("JOIN")) {
            res = msg.split(" ");
            if (games[res[1]] !== null) { //game exists!
                games[res[1]].player2.socket = sock;
                sock.write("JOIN success\n");
                // games[res[1]].player1.socket.write("JOIN success\n");
                currentgamecode = res[1];
                playernumber = 2;
            } else {
                sock.write("JOIN fail\n");
            }
        }
        if (currentgamecode !== null) {
            if (msg.includes("SENDBOARD")) {
                res = msg.split(" ");
                games[currentgamecode]["player" + playernumber].board = [
                    ["x", "x", "x", "x", "x"],
                    ["x", "x", "x", "x", "x"],
                    ["x", "x", "x", "x", "x"],
                    ["x", "x", "x", "x", "x"],
                    ["x", "x", "x", "x", "x"]
                ]
                for (var i = 1; i < 11; i += 2) {
                    games[currentgamecode]["player" + playernumber].board[parseInt(res[i])][parseInt(res[i + 1])] = "s";
                }
                // console.log(games[currentgamecode]["player" + playernumber].board);
                if (games[currentgamecode].player2.board !== null && games[currentgamecode].player1.board !== null){
                    games[currentgamecode].player1.socket.write("MOVEFIRST yes\n");
                    games[currentgamecode].player2.socket.write("MOVEFIRST no\n");
                }
            } else if (msg.includes("MOVE")) {
                res = msg.split(" ");
                if (res[1] === "surrender") {
                    sock.write("MOVE surrendered")
                    if (playernumber === 1) {
                        games[currentgamecode].player2.socket.write("MOVE surrendered\n");
                    } else {
                        games[currentgamecode].player1.socket.write("MOVE surrendered\n");
                    }
                    delete games[currentgamecode];
                } else {
                    if (playernumber === 1) {
                        console.log(res);
                        console.log(msg);
                        if (games[currentgamecode].player2.board[res[1]][res[2]] === 's') {
                            games[currentgamecode].player1.socket.write("MOVE hit " + (res[1]) + " " + res[2]+"\n");
                            games[currentgamecode].player2.socket.write("MOVE hit " + (res[1]) + " " + res[2]+"\n");
                            games[currentgamecode].player2.board[res[1]][res[2]] = "x";
                        } else if (games[currentgamecode].player2.board[res[1]][res[2]] === 'x') {
                            games[currentgamecode].player1.socket.write("MOVE miss " + res[1] + " " + res[2]+"\n");
                            games[currentgamecode].player2.socket.write("MOVE miss " + res[1] + " " + res[2]+"\n");
                        }
                    } else {
                        if (games[currentgamecode].player1.board[res[1]][res[2]] === 's') {
                            games[currentgamecode].player1.socket.write("MOVE hit " + res[1] + " " + res[2]+"\n");
                            games[currentgamecode].player2.socket.write("MOVE hit " + res[1] + " " + res[2]+"\n");
                            games[currentgamecode].player1.board[res[1]][res[2]] = "x";
                        } else if (games[currentgamecode].player1.board[res[1]][res[2]] === 'x') {
                            games[currentgamecode].player1.socket.write("MOVE miss " + res[1] + " " + res[2]+"\n");
                            games[currentgamecode].player2.socket.write("MOVE miss " + res[1] + " " + res[2]+"\n");
                        }
                    }
                    var player1hasremaining = null;
                    var player2hasremaining = null;
                    for (var i = 0; i < 5; i++) {
                        for (var j = 0; j < 5; j++) {
                            if (games[currentgamecode].player1.board[i][j] === "s") {
                                player1hasremaining = true;
                            }
                            if (games[currentgamecode].player2.board[i][j] === "s") {
                                player2hasremaining = true;
                            }
                        }
                    }
                    if (!player1hasremaining && player2hasremaining) {
                        games[currentgamecode].player1.socket.write("GAMEEND lose\n");
                        games[currentgamecode].player2.socket.write("GAMEEND win\n");
                        delete games[currentgamecode];
                    } else if (player1hasremaining && !player2hasremaining) {
                        games[currentgamecode].player1.socket.write("GAMEEND win\n");
                        games[currentgamecode].player2.socket.write("GAMEEND lose\n");
                        delete games[currentgamecode];
                    }
                }
            }
        } else {
            sock.write("ERROR \"first make a game, then try to play\"\n")
        }
    })

// Add a 'close' event handler to this instance of socket
sock.on('close', function (data) {
    // console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
});

}).listen(PORT, HOST);

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

// console.log('Server listening on ' + HOST + ':' + PORT);