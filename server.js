server = require('./src/server/app');
var io = require('socket.io')(server);

var messages = ["Welcome! Please try to be civil you fucks."];

io.on('connection', function(socket){
  console.log("received connection");
  socket.on('sendMessage', function(message) {
    messages.push(message);
    io.sockets.emit('receiveMessage', message);
  });
  socket.on('requestInit', function() {
    socket.emit('init', messages);
  });
});

// Start the server (taken from Andy which is taken from Cloud9)
server.listen(process.env.PORT || 3101, process.env.IP || '0.0.0.0', function() {
  var address = server.address();
  console.log('Server is now started on ', address.address + ':' + address.port);
});
