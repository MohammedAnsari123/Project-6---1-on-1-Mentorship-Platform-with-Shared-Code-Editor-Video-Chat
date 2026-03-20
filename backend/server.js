const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const axios = require('axios');
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

  socket.on('code-execution-result', ({ sessionId, result }) => {
    socket.to(sessionId).emit('execution-update', result);
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

// Code Execution Proxy — uses Piston V1 API (V2 is now whitelisted/paid)
app.post('/api/execute', async (req, res) => {
  const { language, version, files } = req.body;
  const code = files?.[0]?.content || '';
  
  // Map language names to Piston V1 identifiers (all tested & verified)
  const langMap = {
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'python3',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'ruby': 'ruby',
    'go': 'go',
    'rust': 'rust',
    'php': 'php',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'csharp': 'csharp',
    'bash': 'bash',
  };
  
  const pistonLang = langMap[language] || language;

  try {
    console.log(`Executing ${pistonLang} code via Piston V1...`);
    const response = await axios.post('https://emkc.org/api/v1/piston/execute', {
      language: pistonLang,
      source: code,
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    console.log('Execution success:', response.data.ran ? 'ran' : 'failed');
    
    // Normalize V1 response to match our frontend expectations
    res.json({
      run: {
        output: response.data.output || response.data.stdout || 'No output',
        stderr: response.data.stderr || '',
      },
      language: response.data.language,
      version: response.data.version,
    });
  } catch (err) {
    console.error('Execution proxy error:', err.response?.data || err.message);
    res.status(500).json({ 
      message: err.response?.data?.message || 'Code execution failed. Please try again.' 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
