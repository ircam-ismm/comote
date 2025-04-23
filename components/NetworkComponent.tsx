import * as React from 'react';

import { batch } from 'react-redux';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectSettings } from '../features/settings/settingsSlice';

import { engine } from '../engine';

export default function NetworkComponent() {
  const settings = useAppSelector((state) => selectSettings(state));

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

  React.useEffect(() => {
    const { outputApi } = settings;
    engine.network.set({ outputApi });
  }, [settings.outputApi]);

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

  return null;
}
