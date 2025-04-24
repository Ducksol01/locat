const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

let users = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Broadcast existing users to new connection
  socket.emit('updateUsers', users);

  socket.on('setUsername', ({ username, location }) => {
    const existingUserIndex = users.findIndex(u => u.username === username);
    if (existingUserIndex >= 0) {
      users[existingUserIndex] = { 
        ...users[existingUserIndex], 
        id: socket.id, 
        location,
        lastSeen: Date.now(), 
        online: true 
      };
    } else {
      users.push({ 
        id: socket.id, 
        username, 
        location, 
        lastSeen: Date.now(), 
        online: true 
      });
    }
    io.emit('updateUsers', users); // Broadcast to ALL users
  });

  socket.on('updateLocation', ({ username, location }) => {
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex >= 0) {
      users[userIndex].location = location;
      users[userIndex].lastSeen = Date.now();
      io.emit('updateUsers', users);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const userIndex = users.findIndex(u => u.id === socket.id);
    if (userIndex >= 0) {
      users[userIndex].online = false;
      users[userIndex].lastSeen = Date.now();
      io.emit('updateUsers', users);
    }
  });
});

http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
