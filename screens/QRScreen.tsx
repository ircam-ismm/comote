import React, { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, Button } from 'react-native';

import { useIsFocused, useFocusEffect } from '@react-navigation/native';

import { CameraView, Camera, PermissionStatus, useCameraPermissions } from "expo-camera";

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
    justifyContent: 'space-between',
  },

  camera: {
    flex: 1,
  },

  info: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: 20,
    margin: 40,
    textAlign: 'center',
  },
});

export default function QRScreen({ navigation }: RootTabScreenProps<'QR'>) {
  const [permission, requestPermission] = useCameraPermissions();
  const isFocused = useIsFocused();

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.info}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  console.log('Camera permission:', permission);

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

  // be sure to completely discard camera when not focused
  return (
    <View style={styles.container}>
      {isFocused
        ? <CameraView
            active={isFocused}
            style={styles.camera}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={handleBarCodeScanned}
            mute={true}
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
