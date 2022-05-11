import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store, persistor } from './store';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react'

import useCachedResources from './hooks/useCachedResources';

import Colors from './constants/Colors';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import NetworkComponent from './components/NetworkComponent';
import SensorsComponent from './components/SensorsComponent';

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
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  const colors = Colors[colorScheme];

  if (!isLoadingComplete) {
    return (
      <LoadingView />
    );
  } else {
    return (
      <Provider store={store}>
        <PersistGate loading={<LoadingView />} persistor={persistor}>
          <SafeAreaProvider>
            <Navigation colorScheme={colorScheme} />
            <StatusBar />

            <Text style={{display: 'none'}}>
              <SensorsComponent />
              <NetworkComponent />
            </Text>

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
