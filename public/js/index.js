const socket = io();

//Template
const roomsTemplate = document.querySelector('#roomsTemplate').innerHTML;

// Elements
const $rooms = document.querySelector('#rooms');

socket.emit('roomsListQuery');

socket.on('roomsList', ({ rooms, users }) => {
  const html = Mustache.render(roomsTemplate, { rooms });
  // const html = Mustache.render(roomsTemplate, { rooms, users });
  $rooms.insertAdjacentHTML('beforeend', html);
});
