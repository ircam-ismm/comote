import * as React from 'react';

import {
  Text,
} from 'react-native';

// react-native URL is incomplete
import isURL from 'validator/es/lib/isURL';
import urlParse from 'url-parse';

// import Osc from 'react-native-osc';

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
  // const [webSocket, setWebSocket] = React.useState(null);
  const [webSocketEventListeners, setWebSocketEventListeners] = React.useState([]);

  const webSocketReadyStateUpdate = () => {
    let webSocketReadyState;

    if (!webSocket) {
      webSocketReadyState = 'CLOSED';
    } else {
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

    dispatch({
      type: 'network/set',
      payload: {
        webSocketReadyState,
      },
    });
  };

  const webSocketClose = () => {
    if(webSocket) {
      webSocketEventListeners.forEach(({ state, callback }) => {
        webSocket.removeEventListener(state, callback);
      });
      webSocket.close();
    }

    setWebSocketEventListeners([]);
    setWebSocket(null);
  };

  // @TODO: try to connect later, and reconnect
  const webSocketUpdate = ({ enabled, url }) => {
    console.log('webSocketUpdate', {enabled, url});
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
          const newWebSocket = new WebSocket(webSocketUrl);
          setWebSocket(newWebSocket);
          ['open', 'close', 'error'].forEach( (state) => {
            newWebSocket.addEventListener(state, () => {
              webSocketReadyStateUpdate();
            });
            webSocketEventListeners.push({
              state,
              callback: webSocketReadyStateUpdate,
            });
          });
          setWebSocketEventListeners(webSocketEventListeners);
        } catch(error) {
          console.error(`Error while creating webSocket with url '${webSocketUrl}'`,
                        error.message);
        }
      }
    }

    webSocketReadyStateUpdate();
  };

  const setOsc = (oscRequest) => {
    osc = oscRequest;
  }

  const oscClose = () => {
    // if(osc) {
    //   osc.close();
    // }

    setOsc(null);
  };

  const oscUpdate = ({ enabled, url }) => {
    console.log('oscUpdate', {enabled, url});
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

      const {hostname, port} = urlParse(oscUrl);
      if (urlValidated && hostname && port) {
        try {
          // const newOsc = Osc.createClient(hostname, port);
          const newOsc = true; // console.log only
          setOsc(newOsc);
        } catch(error) {
          console.error(`Error while creating osc with url '${oscUrl}'`,
                        error.message);
        }
      }
    }

  };

  const networkSend = (data) => {
    if (settings.webSocketEnabled && webSocket
        && network.webSocketReadyState === 'OPEN'
    ) {
      const dataSerialised = JSON.stringify(data);
      webSocket.send(dataSerialised);
    }

    if (settings.oscEnabled && osc) {
      for(key in data) {
        switch(key) {
        case 'source': {
          break;
        }
        case 'id': {
          break;
        }

        case 'devicemotion': {
          const address = `/${data.source}/${data.id}/${key}`;

          const {interval, accelerationIncludingGravity, rotationRate} = data[key];
          const {x, y, z} = accelerationIncludingGravity;
          const {alpha, beta, gamma} = rotationRate;
          const values = [
            interval,
            x, y, z,
            alpha, beta, gamma,
          ];

          console.log('osc-send', address, values);
          break;
        }

        default: {
          const address = `/${data.source}/${data.id}/${key}`;
          const value = data[key];

          console.log('osc-send', address, value);
          break;
        }


        }


      }
    }
  };

  // update on dependencies change
  React.useEffect(() => {
    webSocketUpdate({
      enabled: settings.webSocketEnabled,
      url: settings.webSocketUrl,
    });
  }, [settings.webSocketEnabled, settings.webSocketUrl]);

  // update on dependencies change
  React.useEffect(() => {
    oscUpdate({
      enabled: settings.oscEnabled,
      url: settings.oscUrl,
    });
  }, [settings.oscEnabled, settings.oscUrl]);


  const [intervalId, setIntervalId] = React.useState(null);
  const accelerationIncludingGravityRef = React.useRef();
  const rotationRateRef = React.useRef();

  // update sensors ref everytime sensors state is updated
  React.useEffect(() => {
    accelerationIncludingGravityRef.current = sensors.accelerationIncludingGravity;
  }, [sensors.accelerationIncludingGravity]);

  React.useEffect(() => {
    rotationRateRef.current = sensors.rotationRate;
  }, [sensors.rotationRate]);

  // render on webSocketReadyState update
  React.useEffect(() => {
    console.log('network.webSocketReadyState', network.webSocketReadyState);

    if (network.webSocketReadyState === 'OPEN') {
      clearInterval(intervalId);

      setIntervalId(setInterval(() => {
        const { id } = settings;
        const accelerationIncludingGravity = accelerationIncludingGravityRef.current;
        const rotationRate = rotationRateRef.current;

        const msg = {
          source: 'comote',
          id,
          devicemotion: {
            interval: settings.deviceMotionInterval,
            accelerationIncludingGravity,
            rotationRate,
          }
        };

        networkSend(msg);
      }, settings.deviceMotionInterval));
    } else {
      console.log('clearInterval', intervalId);
      clearInterval(intervalId);
    }

    return () => clearInterval(intervalId);
  }, [network.webSocketReadyState, settings.deviceMotionInterval]);

  // @TODO: group data and limit in time
  React.useEffect(() => {
    const { buttonA } = sensors;
    const { id } = settings;
    networkSend({ source: 'comote', id, buttonA });
  }, [sensors.buttonA]);

  // @TODO: group data and limit in time
  React.useEffect(() => {
    const { buttonB } = sensors;
    const { id } = settings;
    networkSend({ source: 'comote', id, buttonB });
  }, [sensors.buttonB]);

  // clean-up on unmount
  React.useEffect(() => {
    return () => {
      webSocketClose();
      webSocketReadyStateUpdate();
    }
  }, []);

  return (
    <Text>
        Network {network.webSocketReadyState}
    </Text>
  );
}
