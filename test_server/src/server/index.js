import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';

import getConfig from '../utils/getConfig.js';
import ReCoMoteServer from './ReCoMoteServer.js';

import infos from './schemas/infos.js';

const ENV = process.env.ENV || 'default';
const RECOMOTE_SOCKET_PORT = 8901;

const config = getConfig(ENV);
const server = new Server();

// html template and static files (in most case, this should not be modified)
server.templateEngine = { compile };
server.templateDirectory = path.join('.build', 'server', 'tmpl');
server.router.use(serveStatic('public'));
server.router.use('build', serveStatic(path.join('.build', 'public')));
server.router.use('vendors', serveStatic(path.join('.vendors', 'public')));

console.log(`
--------------------------------------------------------
- launching "${config.app.name}" in "${ENV}" environment
- [pid: ${process.pid}]
- recomote server socket port: ${RECOMOTE_SOCKET_PORT}
--------------------------------------------------------
`);

// -------------------------------------------------------------------
// register plugins
// -------------------------------------------------------------------
// server.pluginManager.register(pluginName, pluginFactory, [pluginOptions], [dependencies])

// -------------------------------------------------------------------
// register schemas
// -------------------------------------------------------------------
server.stateManager.registerSchema('infos', infos);


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

    // run recomote server ---------------------------------------
    const reCoMoteServer = new ReCoMoteServer({
      ws: {
        port: RECOMOTE_SOCKET_PORT,
        // autostart: true,
      },
      osc: {
        port: 3333,
        autostart: true,
      },
      verbose: true,
    });

    await reCoMoteServer.start();

    const wifiInfos = reCoMoteServer.getWifiInfos();
    // -----------------------------------------------------------
    const infos = await server.stateManager.create('infos', wifiInfos);

    const playerExperience = new PlayerExperience(server, 'player');

    // start all the things
    await server.start();
    playerExperience.start();

  } catch (err) {
    console.error(err.stack);
  }
})();

process.on('unhandledRejection', (reason, p) => {
  console.log('> Unhandled Promise Rejection');
  console.log(reason);
});
