import React, { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, Button } from 'react-native';
import { Text, View  } from '../components/Themed';

import { RootTabScreenProps } from '../types';

import { useIsFocused } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';

import { urlHandler } from '../navigation/LinkingConfiguration';


// @TODO: activate camera (and scanner) only when view is active

// https://docs.expo.dev/versions/latest/sdk/bar-code-scanner/
// Note: Passing undefined to the onBarCodeScanned prop will result in no
// scanning. This can be used to effectively "pause" the scanner so that it
// doesn't continually scan even after data has been retrieved.


// @TODO: limit code type to what is generated

export default function QRScreen({ navigation }: RootTabScreenProps<'QR'>) {
  const [hasPermission, setHasPermission] = useState<Boolean|null>(null);

  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.log('Error requesting permission for camera', error);
        setHasPermission(false);
        }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: {type: any, data: string}): void => {
    console.log('scanned',
                'type = ', type,
                'data = ', data,
               );
    urlHandler({url: data});
    navigation.navigate('Settings');
  };

  if (hasPermission === null) {
    return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text}>
          Requesting for camera permission...
        </Text>
      </View>
    </View>
    );
  }

  if (hasPermission === false) {
    return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.text}>
          No permission to access camera.
        </Text>
        <Button style={styles.button}
                title={'Open App settings'}
                onPress={() => {
                  Linking.openSettings();
                }} />
      </View>
    </View>
    );
  }

  // be sure to completely discard camera when not focused
  return (
    <View style={styles.container}>
      {isFocused
       ? <BarCodeScanner
           onBarCodeScanned={isFocused ? handleBarCodeScanned : undefined}
           style={StyleSheet.absoluteFillObject}
         />
       : <View style={styles.info}>
           <Text style={styles.text}>
             Waiting for camera...
           </Text>
         </View>
       }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
  },
  text: {
    fontSize: 20,
  },
  button: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
