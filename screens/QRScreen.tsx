import React, { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, Button } from 'react-native';

import { useIsFocused } from '@react-navigation/native';

import { CameraView, Camera } from "expo-camera";

import i18n from '../constants/i18n';
import store from '../store';

import { Text, View  } from '../components/Themed';
import { RootTabScreenProps } from '../types';

import { urlHandler } from '../navigation/LinkingConfiguration';

// @TODO: limit code type to what is generated

// Note: Passing undefined to the onBarcodeScanned prop will result in no
// scanning. This can be used to effectively "pause" the scanner so that it
// doesn't continually scan even after data has been retrieved.

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

export default function QRScreen({ navigation }: RootTabScreenProps<'QR'>) {
  const [hasPermission, setHasPermission] = useState<Boolean|null>(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
      } catch (error) {
        console.log('Error requesting permission for camera', error);
        setHasPermission(false);
      }
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: {type: any, data: string}): void => {
    console.log('scanned', 'type =', type, 'data =', data);
    // this is not synchronous
    urlHandler({ url: data });
    // access store directly, for some reason using `settings` from `useAppSelector`
    // does not reflect the changes
    const state = store.getState();

    if (state.settings.data.webviewContent === null) {
      navigation.navigate('Home');
    } else {
      navigation.navigate('WebView');
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.text}>
            {i18n.t('qrcode.requestingPermission')}
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
            {i18n.t('qrcode.noPermission')}
          </Text>
          <Button
            style={styles.button}
            title={i18n.t('qrcode.openSettings')}
            onPress={() => {
              Linking.openSettings();
            }}
          />
        </View>
      </View>
    );
  }

  // be sure to completely discard camera when not focused
  return (
    <View style={styles.container}>
      {isFocused
       ? <CameraView
           onBarcodeScanned={isFocused ? handleBarCodeScanned : undefined}
           style={StyleSheet.absoluteFillObject}
         />
       : <View style={styles.info}>
           <Text style={styles.text}>
             {i18n.t('qrcode.waitingCamera')}
           </Text>
         </View>
       }
    </View>
  );
}
