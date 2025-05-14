// socket-client.js
const io = require('socket.io-client');

const socket = io('http://localhost:3000', {
  query: {
    userId: '67e7307eb3aaae23dddaa1fb'
  }
});

socket.on('connect', () => {
  console.log('🟢 Connected to notification service');
});

socket.on('notification', (msg) => {
  console.log('📩 Notification Received:', msg);
});
