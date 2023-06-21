import * as React from 'react';

import {
  Text,
} from 'react-native';

import { batch } from 'react-redux';

// react-native URL is incomplete
import isURL from 'validator/es/lib/isURL';
import urlParse from 'url-parse';

import dgram from 'react-native-udp';
import OSC from 'osc-js';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';
import { selectSensors } from '../features/sensors/sensorsSlice';
import { selectSettings } from '../features/settings/settingsSlice';

let webSocketEnabled = false;
let webSocketUrl = null;
let webSocket = null;

let oscEnabled = false;
let oscUrl = null;
let osc = null;

export default function NetworkComponent({ color }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const sensors = useAppSelector((state) => selectSensors(state));
  const network = useAppSelector((state) => selectNetwork(state));
  const dispatch = useAppDispatch();

  const setWebSocket = (webSocketRequest) => {
    webSocket = webSocketRequest;
  }
  const [webSocketEventListeners, setWebSocketEventListeners] = React.useState([]);

  const cleanup = () => {
    webSocketClose();
    oscClose();
  };

  const webSocketReadyStateUpdate = () => {
    let webSocketReadyState;

    if (!webSocket) {
      webSocketReadyState = 'CLOSED';
    } else {
      console.log('webSocket.readyState', webSocket.readyState);

      switch(webSocket.readyState) {
        case WebSocket.CONNECTING:
          webSocketReadyState = 'CONNECTING';
          break;

        case WebSocket.OPEN:
          webSocketReadyState = 'OPEN';
          break;

        case WebSocket.CLOSING:
          webSocketReadyState = 'CLOSING';
          break;

        default:
        case WebSocket.CLOSED:
          webSocketReadyState = 'CLOSED';
          break;
      }
    }

    batch(() => {
      dispatch({
        type: 'network/set',
        payload: { webSocketReadyState },
      });

      if (webSocketReadyState === 'CLOSED') {
        dispatch({
          type: 'settings/set',
          payload: { webSocketEnabled: false },
        });
      }
    });
  };

  const webSocketClose = () => {
    if (webSocket) {
      webSocketEventListeners.forEach(({ state, callback }) => {
        // @review - callback is probably not what we think here, and not removed then
        webSocket.removeEventListener(state, callback);
      });

      webSocket.close();
    }

    setWebSocketEventListeners([]);
    setWebSocket(null);
    webSocketReadyStateUpdate();
  };

  // @TODO: try to connect later, and reconnect
  const webSocketUpdate = ({ enabled, url }) => {
    console.log('webSocketUpdate', { enabled, url });
    let changed = false;

    if (typeof enabled !== 'undefined') {
      changed = changed || webSocketEnabled !== enabled;
      webSocketEnabled = enabled;
    }

    if (typeof url !== 'undefined') {
      changed = changed || webSocketUrl !== url;
      console.log('webSocket URL changed to ', url);
      webSocketUrl = url;
    }

    if (!changed) {
      return;
    }

    if (webSocket) {
      webSocketClose();
    }

    if (webSocketEnabled && webSocketUrl) {
      // validate URL before creating socket,
      // because (native) error is not catched and will crash application
      const urlValidated = isURL(webSocketUrl, {
        require_protocol: true,
        require_valid_protocol: true,
        protocols: ['ws', 'wss'],
        require_host: true,
      });

      if (urlValidated) {
        // warning: (native) error is not catched and will crash application
        try {
          console.log('open socket');
          const newWebSocket = new WebSocket(webSocketUrl);
          setWebSocket(newWebSocket);

          ['open', 'close', 'error'].forEach((state) => {
            newWebSocket.addEventListener(state, webSocketReadyStateUpdate);

            setWebSocketEventListeners((listeners) => [...listeners, {
                state,
                callback: webSocketReadyStateUpdate,
            }]);
          });

        } catch(error) {
          console.error(`Error while creating webSocket with url '${webSocketUrl}'`);
          console.error(error.message)
        }
      }
    }

    webSocketReadyStateUpdate();
  };

  const setOsc = (oscRequest) => {
    osc = oscRequest;
  }

  const oscClose = () => {
    if (osc) {
      osc.close();
    }

    dispatch({
      type: 'network/set',
      payload: {
        oscReadyState: 'CLOSED',
      },
    });

    setOsc(null);
  };

  const oscSend = (message, port, hostname, errorCallback) => {

    // be sure to release main loop between sends, to avoid blockage
    Promise.resolve().then( () => {

      if(!settings.oscEnabled
         || ! osc
         || network.oscReadyState !== 'OPEN') {
        return;
      }

      const binary = message.pack();

      osc.send(binary, 0, binary.byteLength, port, hostname, (error) => {
        errorCallback(error);
      });

    });

  };

  const oscUpdate = async ({ enabled, url }) => {
    let changed = false;

    if (typeof enabled !== 'undefined') {
      changed = changed || oscEnabled !== enabled;
      oscEnabled = enabled;
    }

    if (typeof url !== 'undefined') {
      changed = changed || oscUrl !== url;
      console.log('osc URL changed to ', url);
      oscUrl = url;
    }

    if (!changed) {
      return;
    }

    if (osc) {
      oscClose();
    }

    if (oscEnabled && oscUrl) {
      // validate URL before creating socket,
      // because (native) error is not catched and will crash application
      const urlValidated = isURL(oscUrl, {
        require_protocol: true,
        require_valid_protocol: true,
        protocols: ['udp'],
        require_host: true,
        require_port: true,
      });
      // these are the remote informations
      const { hostname, port } = urlParse(oscUrl);

      if (urlValidated && hostname && port) {
        try {
          dispatch({
            type: 'network/set',
            payload: { oscReadyState: 'OPENING' },
          });

          const socket = dgram.createSocket({
            type: 'udp4',
          });
          // dynamically find available port
          const localPort = 0;
          socket.bind(localPort);

          socket.once('listening', function() {
            console.log('- socket listening'); 
            dispatch({
              type: 'network/set',
              payload: { oscReadyState: 'OPEN' },
            });

            setOsc(socket);
          });

          socket.on('error', function(err) {
            console.log('OSC error');
            console.error(err);

            dispatch({
              type: 'network/set',
              payload: { oscReadyState: 'CLOSED' },
            });

            setOsc(null);
          });

          socket.on('close', function() {
            dispatch({
              type: 'network/set',
              payload: { oscReadyState: 'CLOSED' },
            });

            setOsc(null);
          });
        } catch(error) {
          console.error(`Error while creating udp socket:`, error.message);
        }
      } else {
        // invalid url abort
        batch(() => {
          dispatch({
            type: 'network/set',
            payload: { oscReadyState: 'CLOSED' },
          });

          dispatch({
            type: 'settings/set',
            payload: { oscEnabled: false },
          });
        });
      }
    } else {
      // no url abort
      batch(() => {
        dispatch({
          type: 'network/set',
          payload: { oscReadyState: 'CLOSED' },
        });

        dispatch({
          type: 'settings/set',
          payload: { oscEnabled: false },
        });
      });
    }

  };

  // @todo - refactor, we probably can do better can do better than packing and
  // unpacking everything here
  const networkSend = (data) => {
    // console.log('----------------------------');
    // console.log('networkSend', data);
    // console.log('sensors.available:', sensors.available);
    // console.log('+ settings.webSocketEnabled', settings.webSocketEnabled);
    // console.log('+ network.webSocketReadyState', network.webSocketReadyState);
    // console.log('> settings.oscEnabled', settings.oscEnabled);
    // console.log('> network.oscReadyState', network.oscReadyState);
    // console.log('----------------------------');

    if (settings.webSocketEnabled && webSocket
        && network.webSocketReadyState === 'OPEN'
        && webSocket.readyState === webSocket.OPEN
    ) {
      const dataSerialised = JSON.stringify(data);
      webSocket.send(dataSerialised);
    }

    if (settings.oscEnabled && osc
      && network.oscReadyState === 'OPEN') {
      let { hostname, port } = urlParse(oscUrl);
      // port = parseInt(port);

      for (let key in data) {
        switch (key) {
          case 'devicemotion': {
            const address = `/${data.source}/${data.id}/${key}`;

            const { interval, accelerationIncludingGravity, rotationRate } = data[key];
            const { x, y, z } = accelerationIncludingGravity;
            const { alpha, beta, gamma } = rotationRate;
            const values = [
              interval,
              x, y, z,
              alpha, beta, gamma,
            ];

            const message = new OSC.Message(address, ...values);
            oscSend(message, parseInt(port), hostname, (err) => {
              if (err) { return console.error(err); }
            });
            break;
          }
          // buttonA / buttonB
          case 'buttonA':
          case 'buttonB': {
            const address = `/${data.source}/${data.id}/${key}`;
            const value = data[key];

            const message = new OSC.Message(address, value);
            oscSend(message, parseInt(port), hostname, (err) => {
              if (err) { return console.error(err); }
            });
            break;
          }

          default: {
            break;
          }
        }
      }
    }
  };

// clean-up on unmount
React.useEffect(() => {
  return () => {
    console.log('NetworkComponent unload');

    cleanup();
  }
}, []);

  // update on state change
  React.useEffect(() => {
    webSocketUpdate({
      enabled: settings.webSocketEnabled,
      url: settings.webSocketUrl,
    });
  }, [settings.webSocketEnabled, settings.webSocketUrl]);

  // update on state change
  React.useEffect(() => {
    oscUpdate({
      enabled: settings.oscEnabled,
      url: settings.oscUrl,
    });
  }, [settings.oscEnabled, settings.oscUrl]);


  // Use references to allow for closures to use the current values,
  // even those not in React.useEffect dependencies

  const settingsIdRef = React.useRef();
  React.useEffect(() => {
    settingsIdRef.current = settings.id;
  }, [settings.id]);

  const settingsDeviceMotionIntervalRef = React.useRef();
  React.useEffect(() => {
    settingsDeviceMotionIntervalRef.current = settings.deviceMotionInterval;
  }, [settings.deviceMotionInterval]);

  const sensorsAvailableRef = React.useRef();
  React.useEffect(() => {
    sensorsAvailableRef.current = sensors.available;
    console.log('sensors.available update', sensorsAvailableRef.current);
  }, [sensors.available]);


  const accelerationIncludingGravityRef = React.useRef();
  React.useEffect(() => {
    accelerationIncludingGravityRef.current = sensors.accelerationIncludingGravity;
  }, [sensors.accelerationIncludingGravity]);

  const rotationRateRef = React.useRef();
  React.useEffect(() => {
    rotationRateRef.current = sensors.rotationRate;
  }, [sensors.rotationRate]);


  const sensorsSend = () => {
    const id = settingsIdRef.current;
    const accelerationIncludingGravity = accelerationIncludingGravityRef.current;
    const rotationRate = rotationRateRef.current;
    const interval = settingsDeviceMotionIntervalRef.current;

    // we need to check that accelerationIncludingGravity, and rotationRate
    // are properly populated, because even if they are declared as available
    // we can still have undefined values at this point
    // @note - in android, rotationRate that is just empty at the beginning
    for (let key of ['x', 'y', 'z']) {
      if (accelerationIncludingGravity[key] === undefined) {
        // console.log('ABORT: undefined value in accelerationIncludingGravity', accelerationIncludingGravity);
        return;
      }
    }

    for (let key of ['alpha', 'beta', 'gamma']) {
      if (rotationRate[key] === undefined) {
        // console.log('ABORT: undefined value in rotationRate', rotationRate);
        return;
      }
    }

    const msg = {
      source: 'comote',
      id,
      devicemotion: {
        interval,
        accelerationIncludingGravity,
        rotationRate,
      }
    };

    networkSend(msg);
  };

  // @TODO: group data and limit in time
  // @note: these are triggered on startup
  React.useEffect(() => {
    const { buttonA } = sensors;
    const id = settingsIdRef.current;
    networkSend({ source: 'comote', id, buttonA });
  }, [sensors.buttonA]);

  // @TODO: group data and limit in time
  // @note: these are triggered on startup
  React.useEffect(() => {
    const { buttonB } = sensors;
    const id = settingsIdRef.current;
    networkSend({ source: 'comote', id, buttonB });
  }, [sensors.buttonB]);

  // send sensors data on new set of data, according to id
  React.useEffect(() => {
    sensorsSend();
  }, [sensors.id]);

  return null;
}
