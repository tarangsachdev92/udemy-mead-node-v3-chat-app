const users = [];

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // Validate the data

  if (!username || !room) {
    return {
      error: 'Username and room are required!',
    };
  }

  // Check for exisiting user
  const exisitingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // Validate username

  if (exisitingUser) {
    return {
      error: 'Username is in use!',
    };
  }

  // Store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

addUser({
  id: 1,
  username: '   tarang',
  room: 'bvd',
});

addUser({
  id: 2,
  username: '   Manish',
  room: 'bvd',
});

const res = addUser({
  id: 12,
  username: 'tarang',
  room: 'jam',
});


console.log('userList of bvd',getUsersInRoom('bvd'));
console.log('userList of jam',getUsersInRoom('jam'));
console.log('userList of rjkt',getUsersInRoom('rjkt'));

console.log('getUser', getUser(1));

console.log(res);

const removedUser = removeUser(1);
console.log(removedUser);
console.log(users);

module.exports = {
  addUser,
};
