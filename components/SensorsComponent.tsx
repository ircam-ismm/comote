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
        // WE need at least the accelerometer to work
        const { accelerometerAvailable } = data;
        const available = accelerometerAvailable;
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
                magnetometerAvailable,
                headingAvailable,
            } = await engine.sensors.sensorsAvailable();

            console.log('- accelerometers available:', accelerometerAvailable);
            console.log('- gyroscopes available:', gyroscopeAvailable);
            console.log('- magnetometers available:', magnetometerAvailable);
            console.log('- heading available:', headingAvailable);

            // We need at least accelerometer to work
            availableCallback({
                accelerometerAvailable,
                gyroscopeAvailable,
                magnetometerAvailable,
                headingAvailable,
            });

            if (!accelerometerAvailable) {
                // dispatch({
                //   type: 'sensors/set',
                //   payload: { available },
                // });
                // @todo - show error screen
                console.error('Sensors not available!');
            } else if (!gyroscopeAvailable) {
                console.error('Gyroscope not available!');
            }

        })();


    }, []);

    React.useEffect(() => {
        const interval = settings.sensorsInterval;
        engine.sensors.intervalSet(interval);
    }, [settings.sensorsInterval]);

    return null;
}
