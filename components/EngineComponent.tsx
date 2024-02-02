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
        const appStateSubscription = AppState.addEventListener('change', async (nextAppState) => {

            if (appState.current.match(/inactive|background/)
                && nextAppState === 'active') {
                // app has come to the foreground

                // reset
                await engine.cleanup();
                await engine.init();
            }

            appState.current = nextAppState;
        });

        return () => {
            (async () => {
                // unmount
                await engine.cleanup();
                appStateSubscription.remove();
            })();
        }
    }, []);

    return (
        <Text style={{ display: 'none' }}>
            <SensorsComponent />
            <NetworkComponent />
        </Text>
    );
}
