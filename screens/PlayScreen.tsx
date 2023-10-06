import * as React from 'react';

import {
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';

import i18n from '../constants/i18n';

import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

import { Text, View } from '../components/Themed';
import ConnectionStatusComponent from '../components/ConnectionStatusComponent';

import { useAppDispatch } from '../hooks';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import ButtonsView from './ButtonsView';

export default function PlayScreen({ color }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      minHeight: '100%',
      flex: 1,
      justifyContent: 'space-between',
      flexDirection: 'column',
      alignItems: 'stretch',
      padding: 16,
    },

    network: {
      flexGrow: 1,
      flexShrink: 0,
      flexBasis: 'auto',
    },

    buttonsContainer: {
      flexGrow: 1,
      flexShrink: 1,
      justifyContent: 'space-around',
      flexDirection: 'column',
      alignItems: 'stretch',
      marginTop: 16,
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },

    button: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      marginLeft: 32,
      marginRight: 32,
      marginBottom: 16,
      marginTop: 16,
    },

    buttonA: {
      backgroundColor: colors.yellow,
    },

    buttonB: {
      backgroundColor: colors.blue,
    },

    buttonText: {
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 60,
      color: 'white',
    },

    modal: {
      height: '100%',
      flex: 1,
      justifyContent: 'flex-end',
      flexDirection: 'column',
      alignContent: 'space-around',
      backgroundColor: colors.lowContrast,
      padding: 16,
      paddingBottom: 76,
    },

    buttonLock: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 10,
      backgroundColor: colors.highContrast,
      marginLeft: 32,
      marginRight: 32,
      marginBottom: 16,
      marginTop: 16,
    },

    buttonLockPressed: {
      opacity: 0.6,
    },

    buttonLockText: {
      color: colors.text,
    }
  });

  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = React.useState(false);

  React.useEffect(() => {
    // mount

    return () => {
      // unmount
    }
  }, []);


  // prevent sleep when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      activateKeepAwakeAsync();

      return () => {
        deactivateKeepAwake();
      };
    }, [])
  );

  // @TODO: allow for multitouch

  return (
    <View style={styles.container}>
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
      >
        <View
          style={styles.modal}
        >

          {/* <ConnectionStatusComponent color={color} /> */}

          <ButtonsView styles={styles} />

          <Pressable
            style={({ pressed }) => [
              styles.buttonLock,
              pressed ? styles.buttonLockPressed : {},
            ]}
            onLongPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonLockText}>{i18n.t('play.unlock')}</Text>
          </Pressable>
        </View>
      </Modal>

      <ConnectionStatusComponent color={color} />

      <ButtonsView styles={styles} />

      <Pressable
        style={({ pressed }) => [
          styles.buttonLock,
          pressed ? styles.buttonLockPressed : {},
        ]}
        onLongPress={() => setModalVisible(true)}
      >
        <Text style={styles.buttonLockText}>{i18n.t('play.lock')}</Text>
      </Pressable>
    </View>
  );
}
