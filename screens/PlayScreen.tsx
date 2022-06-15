import * as React from 'react';

import {
  StyleSheet,
  Platform,
  Pressable,
  Modal,
} from 'react-native';

import i18n from 'i18n-js';

import { useFocusEffect } from '@react-navigation/native';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';

import { Text, View } from '../components/Themed';
import ConnectionStatusComponent from '../components/ConnectionStatusComponent';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

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
  },

  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 16,
  },

  buttonA: {
    backgroundColor: '#ffc20a',
  },

  buttonB: {
    backgroundColor: '#0c7bdc',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    paddingBottom: 76,
  },

  buttonLock: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#cdcdcd',
  },

  buttonLockText: {
    color: '#000000',
  }
});

export default function PlayScreen({color}) {
  const dispatch = useAppDispatch();
  const [modalVisible, setModalVisible] = React.useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  // prevent sleep when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      activateKeepAwake();

      return () => {
        deactivateKeepAwake();
      };
    })
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
          <Pressable
            style={({ pressed }) => [
              styles.buttonLock,
              pressed ? { backgroundColor: '#efefef' } : {},
            ]}
            onLongPress={() => setModalVisible(false)}
          >
            <Text>{i18n.t('play.unlock')}</Text>
          </Pressable>
        </View>
      </Modal>

      <ConnectionStatusComponent />
      <View style={styles.buttonsContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonA,
            pressed ? {opacity: 0.5} : {},
          ]}
          onPressIn={() => {
            dispatch({
              type: 'sensors/set',
              payload: {
                buttonA: 1,
              },
            })
          }}
          onPressOut={() => {
            dispatch({
              type: 'sensors/set',
              payload: {
                buttonA: 0,
              },
            })
          }}
        >
          <Text style={styles.buttonText} selectable={false}>
            {i18n.t('play.a')}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.buttonB,
            pressed ? {opacity: 0.5} : {},
          ]}
          onPressIn={() => {
            dispatch({
              type: 'sensors/set',
              payload: {
                buttonB: 1,
              },
            })
          }}
          onPressOut={ () => {
            dispatch({
              type: 'sensors/set',
              payload: {
                buttonB: 0,
              },
            })
          }}
        >
          <Text style={styles.buttonText} selectable={false}>
            {i18n.t('play.b')}
          </Text>
        </Pressable>

        <Pressable
            style={({ pressed }) => [
              styles.buttonLock,
              pressed ? { backgroundColor: '#efefef' } : {},
            ]}
            onLongPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonLockText}>{i18n.t('play.lock')}</Text>
          </Pressable>
      </View>
    </View>
  );
}
