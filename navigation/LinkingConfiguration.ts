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
  if(!url) {
    return;
  }

  const { hostname, path, queryParams } = Linking.parse(url);
  console.log('hostname = ', hostname)
  console.log('path = ', path)
  console.log('queryParams = ', queryParams);

  if(path !== 'settings' && path !== null) {
    return;
  }
  Object.entries(queryParams).forEach( ([key, value]) => {
    if(key === 'ws') {
      store.dispatch({
        type: 'settings/set',
        payload: {
          // convert to boolean
          webSocketEnabled: !!JSON.parse(value),
        },
      });
    }

    if(key === 'ws-url') {
      store.dispatch({
        type: 'settings/set',
        payload: {
          webSocketUrl: value,
        },
      });
    }

    if(key === 'acc-freq') {
      store.dispatch({
        type: 'settings/set',
        payload: {
          accelerometerFrequency: JSON.parse(value),
        },
      });

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

          QR: {
            screens: {
              QRScreen: 'qr',
            },
          },

          Settings: {
            screens: {
              SettingsScreen: 'settings',
            },
          },

          Debug: {
            screens: {
              DebugScreen: 'debug',
            },
          },

          Play: {
            screens: {
              PlayScreen: 'play',
            },
          },
        },
      },

      Modal: 'modal',

      NotFound: '*',
    },
  },
};

export default linking;
