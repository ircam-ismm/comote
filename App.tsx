import * as React from 'react';
import 'expo-dev-client';
import { ActivityIndicator, AppState, StyleSheet, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

import useCachedResources from './hooks/useCachedResources';

import Colors from './constants/Colors';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import EngineComponent from './components/EngineComponent';

import * as Localization from 'expo-localization';
import * as NavigationBar from 'expo-navigation-bar';

import i18n from './constants/i18n';
// testing
// i18n.locale = 'fr-FR';
// i18n.locale = 'en-EN';
// i18n.locale = 'it-IT';
i18n.locale = Localization.getLocales()[0].languageCode || 'en';

// When a value is missing from a language it'll fallback to another language with the key present.
i18n.enableFallback = true;

function LoadingView() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
      <View style={styles.container}>
        <ActivityIndicator size='large' color={colors.tint} />
      </View>
  );
}

export default function App() {
  // hide button navigation bar on Android
  React.useEffect(() => {
    const handleAppStateChange = nextAppState => {
      // If app is being used, hide nav bar
      if (nextAppState === "active") {
        NavigationBar.setVisibilityAsync("hidden");
      }
    }

    // Subscribe to app state changes
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange)
    // Clean up the event listener when the component unmounts
    return () => appStateSubscription.remove();
  }, []);

  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return (
      <LoadingView />
    );
  } else {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoadingView />} persistor={persistor}>
          <SafeAreaProvider style={{ flex: 1 }}>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />
            <EngineComponent />
          </SafeAreaProvider>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    minWidth: '100%',
    minHeight: '100%',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
