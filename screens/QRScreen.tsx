import React, { useState, useEffect } from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, Button } from 'react-native';

import { useIsFocused, useFocusEffect } from '@react-navigation/native';

import { CameraView, Camera, PermissionStatus } from "expo-camera";

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
  // - null: no permission yet, waiting screen
  // - false: not granted, open system settings
  // - true: ok
  const [hasPermission, setHasPermission] = useState<Boolean|null>(null);
  const [cameraPermissionStore, setCameraPermissionStore] = useState<Object>({}); // for debug
  const isFocused = useIsFocused();

  // cf. https://reactnavigation.org/docs/use-focus-effect/
  // cf. https://stackoverflow.com/questions/69987372/react-navigation-v6-using-usecallback-inside-usefocuseffect-issue-invalid-hook-c
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const getPermission = async () => {
        let cameraPermission: PermissionResponse;

        try {
          cameraPermission = await Camera.getCameraPermissionsAsync();
          setCameraPermissionStore(cameraPermission);
        } catch (err) {
          console.error('Camera.getCameraPermissionsAsync', err);
        }

        // Explicitly request permission on status DENIED or UNDETERMINED
        // cf. https://docs.expo.dev/versions/latest/sdk/location/#permissionstatus
        // cf. https://docs.expo.dev/versions/latest/sdk/location/#permissionresponse
        // @note: status seems to be PermissionStatus.UNDETERMINED on fresh install
        // then we need to request permission on these two cases
        if (
          cameraPermission.status === PermissionStatus.DENIED ||
          cameraPermission.status === PermissionStatus.UNDETERMINED
        ) {
          try {
            console.log('try request camera permission');
            cameraPermission = await Camera.requestCameraPermissionsAsync();
            setCameraPermissionStore(cameraPermission);
          } catch (err) {
            console.error('Camera.requestCameraPermissionsAsync', err);
          }
        }

        console.log('cameraPermission', cameraPermission)

        if (isActive) {
          switch (cameraPermission.status) {
            case PermissionStatus.GRANTED:
              setHasPermission(true);
              break;
            case PermissionStatus.DENIED:
            case PermissionStatus.UNDETERMINED:
              setHasPermission(false);
              break;
          }
        }
      }

      getPermission();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // if (hasPermission === null) {
  //   return (
  //     <View style={styles.container}>
  //       <View style={styles.info}>
  //         <Text style={styles.text}>
  //           {i18n.t('qrcode.requestingPermission')}
  //         </Text>
  //       </View>
  //     </View>
  //   );
  // }

  // Also show open settings button when hasPermission is null, in case
  // `requestCameraPermissionsAsync` get stuck for some unknown reason
  if (hasPermission === false || hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.info}>
          <Text style={styles.text}>
            {i18n.t('qrcode.noPermission')}
          </Text>
          {/* <Text style={styles.text}>
            {JSON.stringify(cameraPermissionStore)}
          </Text> */}
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
           onBarcodeScanned={isFocused ? handleBarCodeScanned : undefined}
           mute={true}
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
