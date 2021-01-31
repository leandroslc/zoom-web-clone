const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');

sslCertFile = process.env.SSL_CERT_FILE;
sslKeyFile = process.env.SSL_KET_FILE;

/**
 * @type {https.ServerOptions}
 */
const serverOptions = {};

if (sslCertFile) {
  serverOptions.cert = fs.readFileSync(sslCertFile);
}

if (sslKeyFile) {
  serverOptions.key = fs.readFileSync(sslKeyFile);
}

const server = https.createServer(serverOptions, (_request, response) => {
  response.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST, GET',
  });

  response.end();
});

const io = new socketIO.Server(server, {
  cors: {
    origin: '*',
    credentials: false,
  },
});

/**
 * @param {socketIO.Socket} socket
 */
function onConnect(socket) {
  console.log('Connection', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log('Disconnected', roomId, userId);
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });

    socket.on('chat-message', (message) => {
      socket.to(roomId).broadcast.emit('chat-message-received', message, userId);
    });
  });
}

io.on('connection', onConnect);

const startServer = () => {
  const { address, port } = server.address();

  console.info(`Server running at ${address}:${port}`);
};

server.listen(process.env.PORT || 3000, startServer);
