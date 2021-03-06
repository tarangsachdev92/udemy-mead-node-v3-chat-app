const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
// create server outside of the express library
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

let count = 0;
// server (emit) -> client (receive) - counterUpdated
// client (emit) -> server (receive) - increment

io.on('connection', (socket) => {
  console.log('new websocket connection');
  socket.emit('countUpdated', count);
  socket.on('increment', () => {
    count++;
    // socket.emit('countUpdated', count); // emit only current(specific) connection
    io.emit('countUpdated', count); // emit to all open(Avalilable) connection
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
