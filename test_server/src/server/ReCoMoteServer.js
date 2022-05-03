import os from 'os';

import WebSocket from 'ws';
import isValidUTF8 from 'utf-8-validate';
// import QRCode from 'qrcode';
import qrcode from 'qrcode-terminal';


export default class ReCoMoteServer {
  constructor({
    hostname = null,
    port = 8010
  }) {
    this.hostname = hostname;
    this.port = port;

    this.ips = [];
    const ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(dev => {
      ifaces[dev].forEach(details => {
        const { family, address } = details;
        if (family === 'IPv4' && address !== '127.0.0.1') {
          this.ips.push(address);
        }
      });
    });
  }

  start() {
    const webSocketServer = new WebSocket.Server({ port: this.port });
    this.displayQRCode();

    let socketUid = 0;
    const sockets = new Map();

    webSocketServer.on('connection', (socket, request) => {
      const ip = request.socket.remoteAddress;
      const id = socketUid++;

      sockets.set(id, socket);
      console.log('new socket connection', id, 'from', ip);
      socket.binaryType = "arraybuffer";

      socket.send('Welcome text');
      socket.send('Welcome binary', { binary: true });

      // When you receive a message, send that message to every socket.
      socket.on('message', (data, isBinary) => {
        if(isBinary) {
          if(data instanceof ArrayBuffer) {
            // binary frame
            const message = new Int32Array(data);
            console.log('new binary ArrayBuffer message from', id, ':', message);
          } else {
            console.log('new binary message from', id, ':', data);
          }
        } else {
          if(isValidUTF8(data) ) {
            console.log('new UTF-8 message from', id, ':', data.toString('utf8') );
          } else {
            console.log('new message from', id, ':', data );
          }
        }
      });

      // When a socket closes, or disconnects, remove it from the array.
      socket.on('close', (code, data) => {
        sockets.delete(id);
        const reason = data.toString();
        console.log('close socket connection', id, ':', reason);
      });
    });
  }

  generateQRCodeImage(link = null) {

  }

  displayQRCode() {
    console.log(this.ips);
    if (this.hostname === null) {
      this.ips.forEach(ip => {
        const wsLink = `ws://${ip}:${this.port}`;
        console.log(`> reCoMote listening on: ${wsLink}`);
        qrcode.generate(wsLink, { small: true });
      });
    } else {
      const wsLink = `ws://${this.hostname}:${this.port}`;
      console.log(`> reCoMote listening on: ${wsLink}`);
      qrcode.generate(wsLink, { small: true });
    }
  }

  addListener(callback) {

  }
}
