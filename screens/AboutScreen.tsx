import * as React from 'react';

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
});


export default function HomeScreen({ color, navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.subcontainer}>
        <Text style={styles.paragraph}>
        CoMo.te is developed by Ircam and the Music and Sound Science and Technology Joint Research Unit (STMS), supported by Ircam, CNRS, the French Ministry of Culture and Sorbonne University.
        </Text>
        <Text style={styles.paragraph}>
          Produced with the support of the French Ministry of Education, Youth and Sports (Edu-up system), the National Research Agency (ELEMENT project), and in partnership with Radio France.
        </Text>
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

