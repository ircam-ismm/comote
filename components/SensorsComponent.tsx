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

import { selectSettings } from '../features/settings/settingsSlice';

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
  const settings = useAppSelector(state => selectSettings(state));
  const dispatch = useAppDispatch();

  // create local working values
  const [accelerometerListener, setAccelerometerListener] = React.useState(null);
  const [gyroscopeListener, setGyroscopeListener] = React.useState(null);

  const setSensorsInterval = (interval) => {
    console.log('> setSensorsInterval:', interval);
    Accelerometer.setUpdateInterval(interval);
    Gyroscope.setUpdateInterval(interval);
  };

  const accelerometerSubscribe = () => {
    // console.log('accelerometer.subscribe');
    setAccelerometerListener(Accelerometer.addListener(data => {
      const accelerationIncludingGravity = normalizeAccelerometer(data);
      dispatch({
        type: 'sensors/set',
        payload: { accelerationIncludingGravity },
      });
    }));
  };

  const accelerometerUnsubscribe = () => {
    // console.log('accelerometer.unsubscribe');
    accelerometerListener && accelerometerListener.remove();
    setAccelerometerListener(null);
  };

  const gyroscopeSubscribe = () => {
    setGyroscopeListener(Gyroscope.addListener(data => {
      const rotationRate = normalizeGyroscope(data);

      dispatch({
        type: 'sensors/set',
        payload: { rotationRate },
      });
    }));
  }

  const gyroscopeUnsubscribe = () => {
    gyroscopeListener && gyroscopeListener.remove();
    setGyroscopeListener(null);
  }

  // see https://daveceddia.com/useeffect-hook-examples/
  // run once and callback on unmount
  React.useEffect(async () => {
    const accAvailable = await Accelerometer.isAvailableAsync();
    const gyroAvailable = await Gyroscope.isAvailableAsync();
    console.log('- accelerometers available:', accAvailable);
    console.log('- gyroscopes available:', gyroAvailable);

    if (accAvailable && gyroAvailable) {
      setSensorsInterval(settings.deviceMotionInterval);

      accelerometerSubscribe();
      gyroscopeSubscribe();

      return () => {
        accelerometerUnsubscribe();
        gyroscopeUnsubscribe();
      }
    } else {
      // @todo - show error screen
      console.error('Sensors not available!');
    }
  }, []);

  // run on dependencies update
  React.useEffect(() => {
    setSensorsInterval(settings.deviceMotionInterval);
  }, [settings.deviceMotionInterval]);


  return (
    <Text>
      Sensors Component
    </Text>
  );
}
