import * as React from 'react';

import {
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';

import i18n from '../constants/i18n';

import { Text, View } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useAppSelector } from '../hooks';
import { selectSensorsAvailable } from '../features/sensors/sensorsSlice';

export default function HomeScreen({ color, navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      minHeight: '100%',
    },
  
    title: {
      marginHorizontal: 16,
      marginTop: 40,
      fontSize: 40,
      color: 'white',
      // fontWeight: 'bold',
    },
  
    pageContainer: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'stretch',
      backgroundColor: 'rgba(0, 86, 157, 0.9)',
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
      margin: 8,
      backgroundColor: colors.background,
    },
  });
  
  const sensorsAvailable = useAppSelector(state => selectSensorsAvailable(state));
  React.useEffect(() => {
    // on startup sensorsAvailable is null, so wait for the "real" boolean value
    if (!__DEV__ && sensorsAvailable === false) {
      navigation.navigate('Error');
    }
  }, [sensorsAvailable]);

  return (
    <View style={styles.container}>
      {/* <ImageBackground source={require('../assets/images/bg-home.png')} style={styles.image}> */}
      <View style={styles.pageContainer} >
        <View style={{ backgroundColor: 'rgba(255, 255, 255, 0)' }}>
          <Text style={styles.title}>CoMote</Text>
        </View>

        <View style={styles.groupContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Play')}
          >
            <Text>{i18n.t('home.play')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text>{i18n.t('home.settings')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('QRCode')}
          >
            <Text>{i18n.t('home.qrcode')}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* </ImageBackground> */}
    </View>
  );
}

