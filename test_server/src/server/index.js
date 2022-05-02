import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';
import ControllerExperience from './ControllerExperience.js';

import getConfig from '../utils/getConfig.js';

import WebSocket from 'ws';
import isValidUTF8 from 'utf-8-validate';

const ENV = process.env.ENV || 'default';

const SOCKET_PORT = 8901;

const config = getConfig(ENV);
const server = new Server();

// html template and static files (in most case, this should not be modified)
server.templateEngine = { compile };
server.templateDirectory = path.join('.build', 'server', 'tmpl');
server.router.use(serveStatic('public'));
server.router.use('build', serveStatic(path.join('.build', 'public')));
server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

const webSocketServer = new WebSocket.Server({
  port: SOCKET_PORT,
});

let socketUid = 0;
const sockets = new Map();
webSocketServer.on('connection', (socket, request) => {
  const ip = request.socket.remoteAddress;
  const id = socketUid++;

  sockets.set(id, socket);
  console.log('new socket connection', id, 'from', ip);
  socket.binaryType = "arraybuffer";

  socket.send('Welcome text');
  socket.send('Welcome binary', {binary: true});

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

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
- socket port: ${SOCKET_PORT}
--------------------------------------------------------
`);

// -------------------------------------------------------------------
// register plugins
// -------------------------------------------------------------------
// server.pluginManager.register(pluginName, pluginFactory, [pluginOptions], [dependencies])

// -------------------------------------------------------------------
// register schemas
// -------------------------------------------------------------------
// server.stateManager.registerSchema(name, schema);


(async function launch() {
  try {
    await server.init(config, (clientType, config, httpRequest) => {
      return {
        clientType: clientType,
        app: {
          name: config.app.name,
          author: config.app.author,
        },
        env: {
          type: config.env.type,
          websockets: config.env.websockets,
          subpath: config.env.subpath,
        }
      };
    });

    const playerExperience = new PlayerExperience(server, 'player');
    const controllerExperience = new ControllerExperience(server, 'controller');

    // start all the things
    await server.start();
    playerExperience.start();
    controllerExperience.start();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});
