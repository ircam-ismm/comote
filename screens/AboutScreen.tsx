import * as React from 'react';
import * as Linking from 'expo-linking';

import i18n from 'i18n-js';

import {
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, View, ConnectionStatus } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useAppSelector } from '../hooks';

import logo from '../assets/images/logo.png';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    flexDirection: 'column',
  },

  subcontainer: {
    flex: 0.5,
  },

  paragraph: {
    marginBottom: 16,
  },

  logosContainer: {
    paddingHorizontal: 4,
  },

  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    margin: 0
  },

  button: {
    alignItems: "center",
    padding: 16,
    borderRadius: 4,
    alignSelf: 'stretch'
  },
});


export default function HomeScreen({ color, navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.paragraph}>
          {i18n.t('about.developedBy')}
        </Text>
        <Text style={styles.paragraph}>
          {i18n.t('about.producedBy')}
        </Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.genericButton }]}
          onPress={() => {
            Linking.openURL(i18n.t('about.privacyPolicyLink'));
          }}
        >
          <Text style={{color: 'white'}}>{i18n.t('about.privacyPolicy')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[
        styles.subcontainer,
        styles.logosContainer,
        { backgroundColor: Colors.light.background }
      ]}>
        <Image
          style={styles.logo}
          source={require('../assets/images/logos.png')}
        />
      </View>
    </View>
  );
}

