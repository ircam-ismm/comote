// we put the shim here as it seems to be executed before App.tsx
import bigInt from 'big-integer';
// console.log(bigInt);
if (typeof BigInt === 'undefined') {
  global.BigInt = bigInt;
}


/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';

import store from '../store';

export function urlHandler({
  url = '',
} = {}) {
  if (!url) {
    return;
  }

  const { hostname, path, queryParams } = Linking.parse(url);
  // console.log('hostname = ', hostname);
  // console.log('path = ', path); // path is null
  // console.log('queryParams = ', queryParams);

  if (hostname === 'settings' && Object.keys(queryParams).length > 0) {
    Object.entries(queryParams).forEach(([key, value]) => {
      switch (key) {
        case 'ws-url': {
          store.dispatch({
            type: 'settings/set',
            payload: {
              webSocketUrl: value,
            },
          });
          break;
        }
        case 'ws-enable': {
          store.dispatch({
            type: 'settings/set',
            payload: {
              webSocketEnabled: !!JSON.parse(value), // convert to boolean
            },
          });
          break;
        }
        case 'osc-url': {
          store.dispatch({
            type: 'settings/set',
            payload: {
              oscUrl: value,
            },
          });
          break;
        }
        case 'osc-enable': {
          store.dispatch({
            type: 'settings/set',
            payload: {
              oscEnabled: !!JSON.parse(value), // convert to boolean
            },
          });
          break;
        }
        case 'interval': {
          store.dispatch({
          type: 'settings/set',
            payload: {
              deviceMotionInterval: parseInt(value, 10),
            },
          });
          break;
        }
        case 'id': {
          store.dispatch({
          type: 'settings/set',
            payload: {
              id: value,
            },
          });
          break;
        }
      }
    });
  }
}

Linking.addEventListener('url', urlHandler);

Linking.getInitialURL().then(url => {
  if (url !== null) {
    console.log('initial url:', url);
    urlHandler(url);
  }
}).catch(error => {
  console.log('initialUrlError', error);
});

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.makeUrl('/'),
    'comote://',
  ],
  config: {
    screens: {
      Root: {
        screens: {
          Home: {
            screens: {
              HomeScreen: 'home',
            }
          },
          Play: {
            screens: {
              PlayScreen: 'play',
            },
          },
          Settings: {
            screens: {
              SettingsScreen: 'settings',
            },
          },
          QR: {
            screens: {
              QRScreen: 'qr',
            },
          },
          About: {
            screens: {
              AboutScreen: 'about',
            },
          },
          // Debug: {
          //   screens: {
          //     DebugScreen: 'debug',
          //   },
          // },
        },
      },

      Error: {
        screens: {
          ErrorScreen: 'error',
        },
      },

      Modal: 'modal',

      NotFound: '*',
    },
  },
};

export default linking;
