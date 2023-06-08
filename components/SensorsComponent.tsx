import * as React from 'react';

import {
  Platform,
  Text,
} from 'react-native';

import {
  Accelerometer,
  Gyroscope,
  // Barometer,
  // Magnetometer,
  // MagnetometerUncalibrated,
  // Pedometer,
} from 'expo-sensors';

import { useAppSelector, useAppDispatch } from '../hooks';

import { selectDeviceMotionInterval } from '../features/settings/settingsSlice';

// @see - https://www.w3.org/TR/orientation-event/#devicemotion
// @todo - https://w3c.github.io/accelerometer/
const g = 9.80665;
const normalizeAccelerometer = Platform.OS === 'android'
  ? (data) => ({
    x: data.x * g,
    y: data.y * g,
    z: data.z * g,
  })
  // @todo - recheck that on iOS
  : (data) => ({
    x: -data.x * g,
    y: -data.y * g,
    z: -data.z * g,
  });

// @todo - recheck unit and iOS
const radToDegree = 360 / (2 * Math.PI);
const normalizeGyroscope = Platform.OS === 'android'
  ? (data) => ({
    alpha: data.z * radToDegree, // yaw
    beta: data.x * radToDegree,  // pitch
    gamma: data.y * radToDegree, // roll
  })
  : (data) => ({
    alpha: data.z * radToDegree, // yaw
    beta: data.x * radToDegree,  // pitch
    gamma: data.y * radToDegree, // roll
  });


export default function SensorsComponent({ color }) {
  const deviceMotionInterval = useAppSelector(state => selectDeviceMotionInterval(state));
  const dispatch = useAppDispatch();

  // create local working values
  const [accelerometerListener, setAccelerometerListener] = React.useState(null);
  const accelerometerListenerRef = React.useRef();
    // update sensors ref everytime sensors state is updated
  React.useEffect(() => {
    accelerometerListenerRef.current = accelerometerListener;
}, [accelerometerListener]);

  // create local working values
  const [gyroscopeListener, setGyroscopeListener] = React.useState(null);
  const gyroscopeListenerRef = React.useRef();
    // update sensors ref everytime sensors state is updated
  React.useEffect(() => {
    gyroscopeListenerRef.current = gyroscopeListener;
}, [gyroscopeListener]);


  const gyroscopeListenerListenerRef = React.useRef();

  const cleanup = () => {
    console.log('SensorsComponent unload');

    clearInterval(setSensorsIntervalId);

    accelerometerUnsubscribe();
    gyroscopeUnsubscribe();
  };

  let setSensorsIntervalId = null;
  const setSensorsInterval = async (interval) => {

    clearInterval(setSensorsIntervalId);

    const accAvailable = await Accelerometer.isAvailableAsync();
    const gyroAvailable = await Gyroscope.isAvailableAsync();

    if (accAvailable && gyroAvailable) {
      console.log('> setSensorsInterval:', interval);
      Accelerometer.setUpdateInterval(interval);
      Gyroscope.setUpdateInterval(interval);
    } else {
      // try again later
      setSensorsIntervalId = setInterval(() => {
        setSensorsInterval(interval);
      }, 1000);
    }

  }

  let acc = 0;

  let accelerometerSubscribeId = null;
  const accelerometerSubscribe = async () => {

    clearInterval(accelerometerSubscribeId);

    const accAvailable = await Accelerometer.isAvailableAsync();
    if (accAvailable) {
      setAccelerometerListener(Accelerometer.addListener(data => {
        // console.log('accelerometer listener', acc++);
        const accelerationIncludingGravity = normalizeAccelerometer(data);
        dispatch({
          type: 'sensors/set',
          payload: { accelerationIncludingGravity },
        });
      }));
    } else {
      // try again later
      setSensorsIntervalId = setInterval(() => {
        accelerometerSubscribe();
      }, 1000);
    }

  };

  const accelerometerUnsubscribe = () => {
    clearInterval(accelerometerSubscribeId);
    // console.log('accelerometer.unsubscribe');
    const listener = accelerometerListenerRef.current;
    listener && listener.remove();
    setAccelerometerListener(null);
  };

  let gyr = 0;

  let gyroscopeSubscribeId = null;
  const gyroscopeSubscribe = async () => {
    clearInterval(gyroscopeSubscribeId);

    const gyroAvailable = await Gyroscope.isAvailableAsync();

    if (gyroAvailable) {
      setGyroscopeListener(Gyroscope.addListener(data => {
        const rotationRate = normalizeGyroscope(data);
        // console.log('gyroscope listener', gyr++);

        dispatch({
          type: 'sensors/set',
          payload: { rotationRate },
        });
      }));
    } else {
      // try again later
      gyroscopeSubscribeId = setInterval(() => {
        gyroscopeSubscribe();
      }, 1000);

    }
  };

  const gyroscopeUnsubscribe = () => {
    clearInterval(gyroscopeSubscribeId);
    const listener = gyroscopeListenerRef.current;
    listener && listener.remove();
    setGyroscopeListener(null);
  }

  // clean-up on unmount
  React.useEffect(() => {
    return () => {
      console.log('NetworkComponent unload');

      cleanup();
    }
  }, []);

  // see https://daveceddia.com/useeffect-hook-examples/
  // run once and callback on unmount
  React.useEffect(() => {
    (async () => {
      const accAvailable = await Accelerometer.isAvailableAsync();
      const gyroAvailable = await Gyroscope.isAvailableAsync();
      console.log('- accelerometers available:', accAvailable);
      console.log('- gyroscopes available:', gyroAvailable);

      if (accAvailable && gyroAvailable) {
        dispatch({
          type: 'sensors/set',
          payload: { available: true },
        });

        cleanup();

        setSensorsInterval(deviceMotionInterval);

        accelerometerSubscribe();
        gyroscopeSubscribe();

      } else {
        dispatch({
          type: 'sensors/set',
          payload: { available: false },
        });
        // @todo - show error screen
        console.error('Sensors not available!');
      }
    })();
  }, []);

  // run on dependencies update
  React.useEffect(() => {
    setSensorsInterval(deviceMotionInterval);
  }, [deviceMotionInterval]);


  return null;
}
