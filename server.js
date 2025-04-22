const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store users in memory (for MVP, not production)
let users = {};

io.on('connection', (socket) => {
  // Receive location from client
  socket.on('updateLocation', (location) => {
    users[socket.id] = location;
    // Broadcast all users' locations
    io.emit('usersLocations', users);
  });

  socket.on('disconnect', () => {
    delete users[socket.id];
    io.emit('usersLocations', users);
  });
});

app.get('/', (req, res) => {
  res.send('Location Tracker Backend Running');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
