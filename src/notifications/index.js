const socketIo = require('socket.io');

const connectedUsers = new Map();
let io = null;

exports.setupSocket=(server)=> {
  io = socketIo(server, {
    cors: {
      origin: '*'
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
        const userSockets = connectedUsers.get(userId) || [];
        userSockets.push(socket);
        console.log(`✅ User ${userId} connected`);
        connectedUsers.set(userId, userSockets);
      }

      socket.on('disconnect', () => {
        const userSockets = connectedUsers.get(userId) || [];
        const updatedSockets = userSockets.filter(s => s.id !== socket.id);
        
        if (updatedSockets.length > 0) {
          connectedUsers.set(userId, updatedSockets);
        } else {
          connectedUsers.delete(userId);
        }
      
        console.log(`❌ User ${userId} disconnected`);
      });
      
  });
}

exports.notify = async (ids, socMsg) => {
    // ids ممكن تكون string واحدة أو array
    const userIds = Array.isArray(ids) ? ids : [ids];
  
    userIds.forEach(id => {
      const sockets = connectedUsers.get(id.toString());
      if (sockets && sockets.length > 0) {
        sockets.forEach(socket => {
          socket.emit('notification', socMsg);
        });
        console.log(`📬 Notification sent to user ${id}`);
      } else {
        console.log(`❌ User ${id} not connected`);
      }
    });
  };
  

