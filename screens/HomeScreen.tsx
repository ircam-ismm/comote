import * as React from 'react';

import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { Text, View, ConnectionStatus } from '../components/Themed';
import ConnectionStatusComponent from '../components/ConnectionStatusComponent';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useAppSelector } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';
import { selectSensors } from '../features/sensors/sensorsSlice';

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
  },

  title: {
    marginHorizontal: 16,
    marginTop: 40,
    fontSize: 40,
    color: 'white',
  },

  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  groupContainer: {
    margin: 16,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },

  button: {
    alignItems: "center",
    padding: 16,
    borderRadius: 4,
    marginTop: 8,
  },
});

export default function HomeScreen({ color, navigation }) {
  const network = useAppSelector(state => selectNetwork(state));
  const sensors = useAppSelector(state => selectSensors(state));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  React.useEffect(() => {
    if (!__DEV__ && !sensors.available) {
    // if (!sensors.available) { // uncomment to test error page in a browser
      navigation.navigate('Error');
    }
  }, [sensors.available]);

  return (
    <View style={styles.container}>
      <ImageBackground source={require('../assets/images/bg-home.png')} style={styles.image}>
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
          <Text style={styles.title}>CoMo.te</Text>
        </View>

        <View style={styles.groupContainer}>
          <ConnectionStatusComponent />
        </View>

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background }]}
            onPress={() => navigation.navigate('QR')}
          >
            <Text>Scan QR Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text>Configure</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.background }]}
            onPress={() => navigation.navigate('Play')}
          >
            <Text>Play</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

