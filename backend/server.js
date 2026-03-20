const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const http = require('http');
const { Server } = require('socket.io');

const Message = require('./models/messageModel');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Message History API
app.get('/api/sessions/:id/messages', async (req, res) => {
  try {
    const messages = await Message.find({ sessionId: req.params.id }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ sessionId }) => {
    socket.join(sessionId);
    // Notify others that a peer has joined
    socket.to(sessionId).emit('peer-joined', { userId: socket.id });
    console.log(`User ${socket.id} joined room: ${sessionId}`);
  });

  socket.on('code-change', ({ sessionId, code }) => {
    socket.to(sessionId).emit('code-update', code);
  });

  socket.on('language-change', ({ sessionId, language }) => {
    socket.to(sessionId).emit('language-update', language);
  });

  socket.on('send-message', async (data) => {
    const { sessionId, sessionDbId, senderId, senderName, message, timestamp } = data;
    
    // Broadcast message
    socket.to(sessionId).emit('receive-message', data);
    
    // Save to DB
    try {
      await Message.create({
        sessionId: sessionDbId || sessionId, // Fallback to sessionId if sessionDbId not provided
        senderId,
        message,
        timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // WebRTC Signaling
  socket.on('webrtc-offer', (data) => {
    socket.to(data.sessionId).emit('webrtc-offer', data);
  });

  socket.on('webrtc-answer', (data) => {
    socket.to(data.sessionId).emit('webrtc-answer', data);
  });

  socket.on('webrtc-ice-candidate', (data) => {
    socket.to(data.sessionId).emit('webrtc-ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
