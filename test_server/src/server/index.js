import 'source-map-support/register';
import { Server } from '@soundworks/core/server';
import path from 'path';
import serveStatic from 'serve-static';
import compile from 'template-literal';

import PlayerExperience from './PlayerExperience.js';

import getConfig from '../utils/getConfig.js';
import CoMoteServer from './CoMoteServer.js';

import infos from './schemas/infos.js';

const ENV = process.env.ENV || 'default';

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
    const coMoteServer = new CoMoteServer({
      id: 42,
      frequency: 50, // frequency of the sensors
      ws: {
        port: 8901,
        // hostname: '127.0.0.1',
        // do not set hostname to get ip from wifi configuration
        autostart: false,
      },
      // osc: {
      //   port: 8902,
      //   // hostname: 127.0.0.1
      //   // do not set hostname to get ip from wifi configuration
      //   autostart: true,
      // },
      verbose: true,
    });

    await coMoteServer.start();

    const wifiInfos = coMoteServer.getWifiInfos();
    // -----------------------------------------------------------
    const infos = await server.stateManager.create('infos', wifiInfos);

    coMoteServer.addListener(data => infos.set({ data }));

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
