import * as React from 'react';

import { batch } from 'react-redux';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectSensors } from '../features/sensors/sensorsSlice';
import { selectSettings } from '../features/settings/settingsSlice';

import { engine } from '../engine';

export default function NetworkComponent() {
  const settings = useAppSelector((state) => selectSettings(state));
  const sensors = useAppSelector((state) => selectSensors(state));

  React.useEffect(() => {
    const { webSocketEnabled } = settings;
    engine.network.set({ webSocketEnabled });
  }, [settings.webSocketEnabled]);

  React.useEffect(() => {
    const { webSocketUrl } = settings;
    engine.network.set({ webSocketUrl });
  }, [settings.webSocketUrl]);

  React.useEffect(() => {
    const { oscEnabled } = settings;
    engine.network.set({ oscEnabled });
  }, [settings.oscEnabled]);

  React.useEffect(() => {
    const { oscUrl } = settings;
    engine.network.set({ oscUrl });
  }, [settings.oscUrl]);

  // declare dispatch in main render function
  const dispatch = useAppDispatch();
  const webSocketReadyStateCallback = React.useCallback((state) => {
    batch(() => {
      dispatch({
        type: 'network/set',
        payload: { webSocketReadyState: state },
      });
    });
  }, []);

  const oscReadyStateCallback = React.useCallback((state) => {
    batch(() => {
      dispatch({
        type: 'network/set',
        payload: { oscReadyState: state },
      });
    });
  }, []);

  React.useEffect(() => {
    // Set callbacks on mount
    engine.network.set({
      webSocketReadyStateCallback,
      oscReadyStateCallback,
    });

    return () => {
      // unmount
      engine.network.set({
        webSocketReadyStateCallback: null,
        oscReadyStateCallback: null,
      });
    }
  }, []);

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
    const accelerationIncludingGravity = accelerationIncludingGravityRef.current;
    const rotationRate = rotationRateRef.current;
    const interval = settingsDeviceMotionIntervalRef.current;

    // we need to check that accelerationIncludingGravity, and rotationRate
    // are properly populated, because even if they are declared as available
    // we can still have undefined values at this point
    // @note - in android, rotationRate that is just empty at the beginning
    for (let key of ['x', 'y', 'z']) {
      if (!accelerationIncludingGravity || accelerationIncludingGravity[key] === undefined) {
        // console.log('ABORT: undefined value in accelerationIncludingGravity', accelerationIncludingGravity);
        return;
      }
    }

    for (let key of ['alpha', 'beta', 'gamma']) {
      if (!rotationRate || rotationRate[key] === undefined) {
        // console.log('ABORT: undefined value in rotationRate', rotationRate);
        return;
      }
    }

    const msg = {
      devicemotion: {
        interval,
        accelerationIncludingGravity,
        rotationRate,
      }
    };

    engine.send(msg);
  };

  // @TODO: group data and limit in time
  // @note: these are triggered on startup
  React.useEffect(() => {
    // console.log('button A');
    const { buttonA } = sensors;
    engine.send({ buttonA });
  }, [sensors.buttonA]);

  // @TODO: group data and limit in time
  // @note: these are triggered on startup
  React.useEffect(() => {
    // console.log('button B');
    const { buttonB } = sensors;
    engine.send({ buttonB });
  }, [sensors.buttonB]);

  // send sensors data on new set of data, according to id
  React.useEffect(() => {
    sensorsSend();
  }, [sensors.id]);

  return null;
}
