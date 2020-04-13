const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {
  generateMessage,
  generateLocationMessage,
} = require('./utils/messages');

const {
  addUser,
  getUser,
  getUsersInRoom,
  removeUser,
} = require('./utils/users');

const { addRoom, removeRoom, getAllRooms } = require('./utils/rooms');

const app = express();
// create server outside of the express library
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
  console.log('New Websocket connection');

  // socket.emit('message', generateMessage('Welcome!'));
  // // for sending message except current client
  // socket.broadcast.emit('message', generateMessage('A new User Joined'));

  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      return callback(error);
    }

    socket.join(user.room);
    addRoom(user.room);

    socket.emit('message', generateMessage('Admin', 'Welcome!'));

    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        generateMessage('Admin', `${user.username} has joined!`)
      );

    // every one in the room including current user
    // users' list in sidebar
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
    // socket.emit, io.emit, socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit
  });

  // list of available rooms
  socket.on('roomsListQuery', () => {
    socket.emit('roomsList', getAllRooms());
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed!');
    }

    io.to(user.room).emit('message', generateMessage(user.username, message));

    // callback('Delivered!');
    callback();
  });

  socket.on('sendLocation', (coords, callback) => {
    // io.emit('message', `Location: ${coords.latitude} , ${coords.longitude}`);
    const user = getUser(socket.id);

    io.to(user.room).emit(
      'locationMessage',
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on('disconnect', () => {
    // here we don't need broadcast here as the current client already removed on disconnect sot there is
    // no chance to get notify for that client

    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage('Admin', `${user.username} has left!`)
      );

      removeRoom(user.room);

      // users' list in sidebar
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
