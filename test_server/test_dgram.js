const udp = require('dgram');
const { Server } = require('node-osc');

// --------------------creating a udp server --------------------

// // creating a udp server
// const server = udp.createSocket('udp4');

// // emits when any error occurs
// server.on('error',function(error){
//   console.log('Error: ' + error);
//   server.close();
// });

// // emits on new datagram msg
// server.on('message',function(msg,info){
//   console.log('Data received from client : ' + msg.toString());
//   console.log('Received %d bytes from %s:%d\n',msg.length, info.address, info.port);
// });

// //emits when socket is ready and listening for datagram msgs
// server.on('listening',function(){
//   const address = server.address();
//   const port = address.port;
//   const family = address.family;
//   const ipaddr = address.address;
//   console.log('Server is listening at port' + port);
//   console.log('Server ip :' + ipaddr);
//   console.log('Server is IP4/IP6 : ' + family);
// });

// //emits after the socket is closed using socket.close();
// server.on('close',function(){
//   console.log('Socket is closed !');
// });

// server.bind(5555);

const server = new Server(5555, '192.168.1.19', () => {
  console.log('OSC Server is listening on port', 5555);
});

server.on('message', msg => {
  console.log('new OSC message');
  console.log(msg);
});
