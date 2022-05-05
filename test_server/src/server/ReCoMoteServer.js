import os from 'os';

import WebSocket from 'ws';
import isValidUTF8 from 'utf-8-validate';
import { Server } from 'node-osc';

import cloneDeep from 'clone-deep';
import assignDeep from 'assign-deep';
// import QRCode from 'qrcode';
import qrcode from 'qrcode-terminal';

export default class ReCoMoteServer {
  constructor(config) {
    this.config = cloneDeep(assignDeep({
      hostname: null,
      osc: null, // same format as ws
      ws: {
        port: 8888,
        autostart: false,
      },
      verbose: false,
    }, config));

    if (this.config.verbose) {
      console.log('+ [debug] ReCoMote config:');
      console.log(this.config, '\n');
    }

    this._ips = [];
    const ifaces = os.networkInterfaces();

    Object.keys(ifaces).forEach(dev => {
      ifaces[dev].forEach(details => {
        const { family, address } = details;
        if (family === 'IPv4' && address !== '127.0.0.1') {
          this._ips.push(address);
        }
      });
    });

    this._websocketServer = null;
    this._oscServer = null;
    this._listeners = new Set();
  }

  start() {
    if (this.config.ws !== null) {
      if (!Number.isInteger(this.config.ws.port)) {
        throw new Error(`Invalid port "${this.config.ws.port}" for WebSocket server`);
      }

      this._websocketServer = new WebSocket.Server({ port: this.config.ws.port });
      this.displayQRCode();

      let socketUid = 0;
      const sockets = new Map();

      this._websocketServer.on('connection', (socket, request) => {
        const ip = request.socket.remoteAddress;
        const id = socketUid++;

        sockets.set(id, socket);
        console.log('new socket connection', id, 'from', ip);
        socket.binaryType = "arraybuffer";

        socket.send('Welcome text');
        socket.send('Welcome binary', { binary: true });

        // When you receive a message, send that message to every socket.
        socket.on('message', (data, isBinary) => {
          if (isBinary) {
            if (data instanceof ArrayBuffer) {
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

          // this._listeners.forEach(callback => callback(id, data));
        });

        // When a socket closes, or disconnects, remove it from the array.
        socket.on('close', (code, data) => {
          sockets.delete(id);
          const reason = data.toString();
          console.log('close socket connection', id, ':', reason);
        });
      });
    }

    if (this.config.osc !== null) {
      const hostname = this.config.hostname ? this.config.hostname : '0.0.0.0';
      this._oscServer = new Server(this.config.osc.port, hostname, () => {
        console.log('OSC Server is listening');
      });

      this._oscServer.on('message', msg => {
        let id = msg.shift();
        console.log('new OSC message from:', id, ':', msg);

        // const data = this._formatRawMsg(msg); // back to object
        // this._listeners.forEach(callback => callback(id, data));
      });
    }
  }

  close() {
    if (this._websocketServer) {
      this._websocketServer.close();
    }

    if (this._oscServer) {
      this._oscServer.close();
    }
  }

  /**
   * return path to image
   */
  generateQRCodeImage(link = null) {

  }

  _displayWebSocketQRCode(host) {
    const wsLink = `ws://${host}:${this.config.ws.port}`;
    console.log(`> ReCoMote websocket server listening on: ${wsLink}`);

    let recomoteLink = `recomote://settings?ws-url=${wsLink}&ws=${this.config.ws.autostart ? 'true' : 'false'}`;

    if (this.config.verbose) {
      console.log('+ [debug] ReCoMote websocket link:', recomoteLink);
    }

    qrcode.generate(recomoteLink, { small: true });
  }

  _displayOscQRCode(host) {
    const oscLink = `udp://${host}:${this.config.osc.port}`;
    console.log(`> ReCoMote osc server listening on: ${oscLink}`);

    let recomoteLink = `recomote://settings?osc-url=${oscLink}&osc=${this.config.osc.autostart ? 'true' : 'false'}`;

    if (this.config.verbose) {
      console.log('+ [debug] ReCoMote osc link:', recomoteLink);
    }

    qrcode.generate(recomoteLink, { small: true });
  }

  displayQRCode() {
    if (this.config.hostname === null) {
      this._ips.forEach(ip => {
        if (this.config.ws !== null) {
          this._displayWebSocketQRCode(ip);
        }
      });

      if (this.config.osc !== null) {
        this._displayOscQRCode('0.0.0.0');
      }
    } else {
      if (this.config.ws !== null) {
        this._displayWebSocketQRCode(this.config.hostname);
      }

      if (this.config.osc !== null) {
        this._displayOscQRCode(this.config.hostname);
      }
    }
  }

  addListener(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  removeListener(callback) {
    this._listeners.delete(callback);
  }
}
