import * as React from 'react';
import { AppState, Text } from 'react-native';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectSettings } from '../features/settings/settingsSlice';

import NetworkComponent from './NetworkComponent';
import SensorsComponent from './SensorsComponent';

import { engine } from '../engine';

export default function EngineComponent() {
    const settings = useAppSelector((state) => selectSettings(state));
    const appState = React.useRef(AppState.currentState);

    React.useEffect(() => {
        const { id } = settings;
        engine.set({ id });
    }, [settings.id]);

    React.useEffect(() => {
        // mount
        const appStateSubscription = AppState.addEventListener('change', nextAppState => {
            if (appState.current.match(/inactive|background/)
                && nextAppState === 'active') {
                // app has come to the foreground

                // reset
                engine.cleanup();
                engine.init();
            }

            appState.current = nextAppState;
        });

        return () => {
            // unmount
            engine.cleanup();
            appStateSubscription.remove();
        }
    }, []);

    return (
        <Text style={{ display: 'none' }}>
            <SensorsComponent />
            <NetworkComponent />
        </Text>
    );
}
