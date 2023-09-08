import * as React from 'react';

import { batch } from 'react-redux';

import { useAppSelector, useAppDispatch } from '../hooks';

import { selectSettings } from '../features/settings/settingsSlice';
import { selectSensors } from '../features/sensors/sensorsSlice';

import { engine } from '../engine';

export default function SensorsComponent() {

  const settings = useAppSelector((state) => selectSettings(state));
  const sensors = useAppSelector((state) => selectSensors(state));


  // declare dispatch in main render function
  const dispatch = useAppDispatch();

  const availableCallback = React.useCallback((data) => {
    const { accelerometerAvailable, gyroscopeAvailable } = data;
    const available = accelerometerAvailable && gyroscopeAvailable;
    batch(() => {
      dispatch({
        type: 'sensors/set',
        payload: { available },
      });
    });
  }, []);

  // see https://daveceddia.com/useeffect-hook-examples/
  // run once and callback on unmount
  React.useEffect(() => {
    // before async mount

    (async () => {
      // async mount
      const {
        accelerometerAvailable,
        gyroscopeAvailable,
      } = await engine.sensors.sensorsAvailable();

      console.log('- accelerometers available:', accelerometerAvailable);
      console.log('- gyroscopes available:', gyroscopeAvailable);

      const available = accelerometerAvailable && gyroscopeAvailable;

      availableCallback(available);

      if (!available) {
        // dispatch({
        //   type: 'sensors/set',
        //   payload: { available },
        // });
        // @todo - show error screen
        console.error('Sensors not available!');
      }
    })();
  }, []);

  React.useEffect(() => {
    // @TODO: rename settings.deviceMotionInterval to settings.sensorsInterval
    const interval = settings.deviceMotionInterval;
    engine.sensors.intervalSet(interval);
  }, [settings.deviceMotionInterval]);
  
  return null;
}
