server = require('./src/server/app');
var io = require('socket.io')(server);

var messages = [{name: 'Server',
                 message: "Welcome! Please try to be civil."
                }];

io.on('connection', function(socket){
  console.log("Received connection");
  
  socket.on('sendMessage', function(message) {
    messages.push(message);
    console.log("Received Message");
    io.sockets.emit('receiveMessage', message);
  });

  socket.on('requestInit', function() {
    socket.emit('init', messages);
    console.log("Sending init");
  });

  socket.on('movieInit', function() {
    socket.join('movie');
  });

  socket.on('sendPlay', function(time) {
    io.to('movie').emit('recPlay', time);
  });

  socket.on('sendPause', function(time) {
    io.to('movie').emit('recPause', time);
  });
});

// Start the server (taken from Andy which is taken from Cloud9)
server.listen(process.env.PORT || 3101, process.env.IP || '0.0.0.0', function() {
  var address = server.address();
  console.log('Server is now started on ', address.address + ':' + address.port);
});
