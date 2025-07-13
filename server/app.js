require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const messageRoutes = require('./routes/message');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
  res.send('Chat server is running');
});

const onlineUsers = new Set();

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Track user online
  socket.on('userOnline', (userId) => {
    socket.userId = userId;
    onlineUsers.add(userId);
    io.emit('onlineUsers', Array.from(onlineUsers));
  });

  // Join a chat room
  socket.on('joinRoom', ({ roomId, userId }) => {
    socket.join(roomId);
    socket.to(roomId).emit('userJoined', { userId, socketId: socket.id });
    console.log(`User ${userId} joined room ${roomId}`);
  });

  // Leave a chat room
  socket.on('leaveRoom', ({ roomId, userId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit('userLeft', { userId, socketId: socket.id });
    console.log(`User ${userId} left room ${roomId}`);
  });

  // Handle sending a message
  socket.on('sendMessage', (message) => {
    console.log('Broadcasting message to room:', message.room, message);
    io.in(message.room).emit('newMessage', message);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers));
    }
    console.log('User disconnected:', socket.id);
  });
});

app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 