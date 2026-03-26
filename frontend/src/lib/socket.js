import { io } from 'socket.io-client';

const socket = io('https://project-6-1-on-1-mentorship-platform.onrender.com', {
  autoConnect: false,
});

export default socket;
