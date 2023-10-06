import { StatusBar } from 'expo-status-bar';
import {
  Platform,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { Text, View } from '../components/Themed';

import { useAppSelector } from '../hooks';
import { selectSensors } from '../features/sensors/sensorsSlice';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export default function ErrorScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      minHeight: '100%',
      backgroundColor: colors.blue,
    },
  
    title: {
      fontSize: 40,
      color: 'white',
    },
  
    image: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'space-around',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  
    groupContainer: {
      flex: 0.4,
      margin: 16,
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255, 255, 255, 0)',
    },
  
    error: {
      fontSize: 16,
      color: 'white',
    }
  });
  
  return (
    <View style={styles.container}>
      <View style={styles.groupContainer}>
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
          <Text style={styles.title}>CoMote</Text>
        </View>

        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
          <Text style={styles.error}>
            Sorry,{'\n'}
            {'\n'}
            Your device is not compatible with the{'\n'}
            CoMote application.
          </Text>
        </View>
      </View>
    </View>
  );
}
