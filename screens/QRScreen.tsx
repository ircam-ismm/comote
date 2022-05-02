import React, { useState, useEffect } from 'react';

import { Text, View  } from '../components/Themed';
import { StyleSheet } from 'react-native';
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

  console.log('focused', isFocused);

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
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera.</Text>;
  }

  return (
    <View style={styles.container}>
      {isFocused ? <BarCodeScanner
                     onBarCodeScanned={isFocused ? handleBarCodeScanned : undefined}
                     style={StyleSheet.absoluteFillObject}
       /> : <Text>Waiting for camera...</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
