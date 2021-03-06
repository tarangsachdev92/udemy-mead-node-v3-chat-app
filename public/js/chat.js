const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
  '#location-message-template'
).innerHTML;
const sideBarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, room, joinRoom } = Qs.parse(location.search, {
  ignoreQueryPrefix: true, // question mark goes away
});

const autoScroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild;

  // Height of the last/new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  // Visible Height
  const visibleHeight = $messages.offsetHeight;

  // Height of messages container
  const containerHeight = $messages.scrollHeight;

  // How far have I scrolled
  const scrollOffset = messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', (message) => {
  // console.log(message, new Date().getTime());
  // console.log(message);
  const html = Mustache.render(messageTemplate, {
    message: message.text,
    username: message.username,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: message.url,
    username: message.username,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sideBarTemplate, {
    users,
    room,
  });
  document.querySelector('#sidebar').innerHTML = html;
});

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  // disable
  // const message = document.querySelector('input').value;
  const message = e.target.elements.message.value;

  socket.emit('sendMessage', message, (error) => {
    // enable
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    if (error) {
      return console.log(error);
    } else {
      console.log('the message was delevered!');
    }
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('GeoLocation is not supported by your browser');
  }

  $sendLocationButton.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    // console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        $sendLocationButton.removeAttribute('disabled');
        // console.log('Location Sharead', new Date().getTime());
        console.log('Location Sharead');
      }
    );
  });
});

socket.emit('join', { username, room: room || joinRoom }, (error) => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
