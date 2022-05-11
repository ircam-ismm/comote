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
  console.log('urlHandler', url);

  if (!url) {
    return;
  }

  const { hostname, path, queryParams } = Linking.parse(url);
  console.log('hostname = ', hostname)
  console.log('path = ', path)
  console.log('queryParams = ', queryParams);

  if (path !== 'settings' && path !== null) {
    return;
  }

  Object.entries(queryParams).forEach( ([key, value]) => {
    switch (key) {
      case 'ws': {
        store.dispatch({
          type: 'settings/set',
          payload: {
            webSocketEnabled: !!JSON.parse(value), // convert to boolean
          },
        });
        break;
      }
      case 'ws-url': {
        store.dispatch({
          type: 'settings/set',
          payload: {
            webSocketUrl: value,
          },
        });
        break;
      }
      case 'osc': {
        store.dispatch({
          type: 'settings/set',
          payload: {
            oscEnabled: !!JSON.parse(value), // convert to boolean
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
      case 'acc-freq': {
        store.dispatch({
        type: 'settings/set',
          payload: {
            accelerometerFrequency: JSON.parse(value),
          },
        });
        break;
      }
    }
  });

}

Linking.addEventListener('url', urlHandler);

Linking.getInitialURL().then( (url) => {
  console.log('initialUrl', url);
  urlHandler(url);
}).catch( (error) => {
  console.log('initialUrlError', error);
});

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.makeUrl('/'),
    'recomote://',
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

      Modal: 'modal',

      NotFound: '*',
    },
  },
};

export default linking;
