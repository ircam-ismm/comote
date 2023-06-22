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

let webSocketCurrent = null;

let oscCurrent = null;

export default function NetworkComponent({ color }) {
  const settings = useAppSelector((state) => selectSettings(state));
  const sensors = useAppSelector((state) => selectSensors(state));
  const network = useAppSelector((state) => selectNetwork(state));
  const dispatch = useAppDispatch();

  const webSocketEnabledRef = React.useRef();
  React.useEffect(() => {
    webSocketEnabledRef.current = settings.webSocketEnabled;
  }, [settings.webSocketEnabled]);

  const webSocketUrlRef = React.useRef();
  React.useEffect(() => {
    webSocketUrlRef.current = settings.webSocketUrl;
  }, [settings.webSocketUrl]);

  const setWebSocket = (webSocketRequest) => {
    webSocketCurrent = webSocketRequest;
  }
  let webSocketEventListeners = [];

  const cleanup = () => {
    clearTimeout(webSocketUpdateId);
    webSocketClose();
    clearTimeout(oscUpdateId);
    oscClose();
  };

  const webSocketReadyStateUpdate = () => {
    let webSocketReadyState;

    if (!webSocketCurrent) {
      webSocketReadyState = 'CLOSED';
    } else {
      switch(webSocketCurrent.readyState) {
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

    });
  };

  const webSocketClose = (webSocket = webSocketCurrent) => {
    if (webSocket) {
      webSocketEventListeners.forEach(({ socket, state, callback }) => {
        socket.removeEventListener(state, callback);
      });

      webSocket.close();
    }

    webSocketEventListeners = [];
    setWebSocket(null);
    webSocketReadyStateUpdate();
  };

  let webSocketUpdateId = null;
  // React.useCallback returns a unique function, needed to remove listener
  const webSocketUpdate = React.useCallback( () => {
    clearTimeout(webSocketUpdateId);

    const webSocketEnabled = webSocketEnabledRef.current;
    const webSocketUrl = webSocketUrlRef.current;

    if (!webSocketEnabled || !webSocketUrl) {
      clearTimeout(webSocketUpdateId);
      webSocketClose();
      return;
    }

    // validate URL before creating socket,
    // because (native) error is not catched and will crash application
    const urlValidated = isURL(webSocketUrl, {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['ws', 'wss'],
      require_host: true,
    });

    if(!urlValidated) {
      clearTimeout(webSocketUpdateId);
      webSocketClose();
      return;
    }

    // warning: (native) error is not catched and will crash application
    try {
      clearTimeout(webSocketUpdateId);
      webSocketClose();

      const webSocketNew = new WebSocket(webSocketUrl);
      setWebSocket(webSocketNew);

      // 'error' triggers 'close' later: no need to double callback
      ['open', 'close'].forEach((state) => {
        const callback = () => {

          // clear time-out in any case
          clearTimeout(webSocketUpdateId);
          webSocketReadyStateUpdate();

          // 'error' triggers 'close' later: no need to double callback
          if (state === 'close') {
            // try again later
            clearTimeout(webSocketUpdateId);
            webSocketClose();
            webSocketUpdateId = setTimeout(webSocketUpdate, 1000);
          }
        };

        webSocketNew.addEventListener(state, callback);

        webSocketEventListeners.push({
          socket: webSocketNew,
          state,
          callback,
        });
      });

    } catch (error) {
      console.error(`Error while creating webSocket with url '${webSocketUrl}'`);
      console.error(error.message);

      // try again later
      clearTimeout(webSocketUpdateId);
      webSocketClose();
      webSocketUpdateId = setTimeout(webSocketUpdate, 1000);
    }
      
    webSocketReadyStateUpdate();
  }, []);

  const oscEnabledRef = React.useRef();
  React.useEffect(() => {
    oscEnabledRef.current = settings.oscEnabled;
  }, [settings.oscEnabled]);

  const oscUrlRef = React.useRef();
  React.useEffect(() => {
    oscUrlRef.current = settings.oscUrl;
  }, [settings.oscUrl]);


  const setOsc = (oscRequest) => {
    oscCurrent = oscRequest;
  }

  const oscClose = (oscSocket = oscCurrent) => {
    if (oscSocket) {
      oscSocket.close();
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

      const oscEnabled = oscEnabledRef.current

      if(!oscEnabled
         || ! oscCurrent
         || network.oscReadyState !== 'OPEN') {
        return;
      }

      const binary = message.pack();

      oscCurrent.send(binary, 0, binary.byteLength, port, hostname, (error) => {
        errorCallback(error);
      });

    });

  };

  let oscUpdateId = null;

  // React.useCallback returns a unique function, needed to remove listener
  const oscUpdate = React.useCallback(() => {
    clearTimeout(oscUpdateId);

    const oscEnabled = oscEnabledRef.current;
    const oscUrl = oscUrlRef.current; 

    if (!oscEnabled || !oscUrl) {
      clearTimeout(oscUpdateId);
      oscClose();
      return;
    }

    // validate URL before creating socket,
    // because (native) error is not catched and will crash application
    const urlValidated = isURL(oscUrl, {
      require_protocol: true,
      require_valid_protocol: true,
      protocols: ['udp'],
      require_host: true,
      require_port: true,
    });

    if(!urlValidated) {
      clearTimeout(oscUpdateId);
      oscClose();
      return;
    }

    // these are the remote informations
    const { hostname, port } = urlParse(oscUrl);

    if(!hostname || !port) {
      clearTimeout(oscUpdateId);
      oscClose();
      return;
    }

    // warning: (native) error is not catched and will crash application
    try {
      clearTimeout(oscUpdateId);
      oscClose();

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

      socket.once('listening', () => {
        dispatch({
          type: 'network/set',
          payload: { oscReadyState: 'OPEN' },
        });

        setOsc(socket);
      });

      socket.on('error', (err) => {
        console.error('OSC error', err);

        // try again later
        clearTimeout(oscUpdateId);
        oscClose();
        oscUpdateId = setTimeout(oscUpdate, 1000);
      });

      socket.on('close', () => {
        // try again later
        clearTimeout(oscUpdateId);
        oscClose();
        oscUpdateId = setTimeout(oscUpdate, 1000);
      });
    } catch (error) {
      console.error(`Error while creating udp socket:`, error.message);
      // try again later
      clearTimeout(oscUpdateId);
      oscClose();
      oscUpdateId = setTimeout(oscUpdate, 1000);
    }
  }, []);

  // @todo - refactor, we probably can do better can do better than packing and
  // unpacking everything here
  const networkSend = (data) => {
    const webSocketEnabled = webSocketEnabledRef.current;

    // console.log('----------------------------');
    // console.log('networkSend', data);
    // console.log('sensors.available:', sensors.available);
    // console.log('+ settings.webSocketEnabled', settings.webSocketEnabled);
    // console.log('+ network.webSocketReadyState', network.webSocketReadyState);
    // console.log('> settings.oscEnabled', settings.oscEnabled);
    // console.log('> network.oscReadyState', network.oscReadyState);
    // console.log('----------------------------');

    if (webSocketEnabled && webSocketCurrent
        && network.webSocketReadyState === 'OPEN'
        && webSocketCurrent.readyState === webSocketCurrent.OPEN
    ) {
      const dataSerialised = JSON.stringify(data);
      webSocketCurrent.send(dataSerialised);
    }

    const oscEnabled = oscEnabledRef.current;
    const oscUrl = oscUrlRef.current; 

    if (oscEnabled && oscCurrent
        && network.oscReadyState === 'OPEN'
        && oscUrl) {
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
    cleanup();
  }
}, []);

  // update on state change
  React.useEffect(() => {
    clearTimeout(webSocketUpdateId);
    webSocketUpdate();
  }, [settings.webSocketEnabled, settings.webSocketUrl]);

  // update on state change
  React.useEffect(() => {
    clearTimeout(oscUpdateId);
    oscUpdate();
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
