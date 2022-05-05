import os from 'os';

import WebSocket from 'ws';
import isValidUTF8 from 'utf-8-validate';
import { Server } from 'node-osc';

import cloneDeep from 'clone-deep';
import assignDeep from 'assign-deep';
import QRCode from 'qrcode';

import si from 'systeminformation';

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

    this._websocketServer = null;
    this._wsLink = null;
    this._wsRecomoteLink = null;

    this._oscServer = null;
    this._oscLink = null;
    this._oscRecomoteLink = null;

    // used to inform clients and generate a QRCode
    this._wifiInfos = {
      ssid: null,
      ip: null,
      wsQRCode: null, // as data url (png)
      oscQRCode: null, // as data url (png)
    }

    this._listeners = new Set();
  }

  async start() {
    const interfaces = await si.networkInterfaces();
    // console.log(interfaces);
    const wifiConnections = await si.wifiConnections();
    // pick first wifi connection
    const conn = wifiConnections[0];
    const int = interfaces.find(int => int.iface === conn.iface);
    // console.log(conn);
    // console.log(int);

    if (conn && int) {
      console.log('> ReCoMote: not Wifi connection found, please connect to a WiFi');
    }

    this._wifiInfos.ssid = conn.ssid;
    this._wifiInfos.ip = int.ip4;

    if (this.config.verbose) {
      console.log('WiFi informations');
      console.log(JSON.stringify(this._wifiInfos, null, 2), '\n');
    }

    if (this.config.ws !== null) {
      if (!Number.isInteger(this.config.ws.port)) {
        throw new Error(`Invalid port "${this.config.ws.port}" for WebSocket server`);
      }

      const host = this.config.hostname ? this.config.hostname : this._wifiInfos.ip;
      this._wsLink = `ws://${host}:${this.config.ws.port}`;
      this._wsRecomoteLink = `recomote://settings?ws-url=${this._wsLink}&ws=${this.config.ws.autostart ? 'true' : 'false'}`;

      this._websocketServer = new WebSocket.Server({ port: this.config.ws.port });

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

      this._oscLink = `udp://${hostname}:${this.config.osc.port}`;
      this._oscRecomoteLink = `recomote://settings?osc-url=${this._oscLink}&osc=${this.config.osc.autostart ? 'true' : 'false'}`;

      this._oscServer = new Server(this.config.osc.port, hostname, () => {
        // console.log('OSC Server is listening');
      });

      this._oscServer.on('message', msg => {
        let id = msg.shift();
        console.log('new OSC message from:', id, ':', msg);

        // const data = this._formatRawMsg(msg); // back to object
        // this._listeners.forEach(callback => callback(id, data));
      });
    }

    await this._createQRCodes();
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
   * return
   * - wifiInfos
   * - osc qr code as
   */
  getWifiInfos() {
    return this._wifiInfos;
  }

  async _createQRCodes() {
    if (this.config.ws !== null) {
      const terminalQRCode = await QRCode.toString(this._wsRecomoteLink, { type: 'terminal', small: true });
      this._wifiInfos.wsQRCode = await QRCode.toDataURL(this._wsRecomoteLink);

      console.log(`> ReCoMote websocket server listening on: ${this._wsLink}`);

      if (this.config.verbose) {
        console.log('+ [debug] ReCoMote websocket link:', this._wsRecomoteLink);
      }

      console.log('');
      console.log(terminalQRCode);
    }

    if (this.config.osc !== null) {
      const qrcode = await QRCode.toString(this._oscRecomoteLink, { type: 'terminal', small: true });
      this._wifiInfos.oscQRCode = await QRCode.toDataURL(this._oscRecomoteLink);

      console.log(`> ReCoMote osc server listening on: ${this._oscLink}`);

      if (this.config.verbose) {
        console.log('+ [debug] ReCoMote osc link:', this._oscRecomoteLink);
      }

      console.log('');
      console.log(qrcode);
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
