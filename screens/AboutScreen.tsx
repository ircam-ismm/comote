import * as React from 'react';

import {
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Text, View, ConnectionStatus } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useAppSelector } from '../hooks';
import { selectNetwork } from '../features/network/networkSlice';

import logo from '../assets/images/logo-como-raw.png';

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    padding: 16,
  },

  paragraph: {
    marginBottom: 8,
  },
});


export default function HomeScreen({ color, navigation }) {
  const network = useAppSelector((state) => selectNetwork(state));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>
      CoMo(te) is developed by Ircam and the Music and Sound Science and Technology Joint Research Unit (STMS), supported by Ircam, CNRS, the Ministry of Culture and Sorbonne University.
      </Text>
      <Text style={styles.paragraph}>
        Produced with the support of the French Ministry of Education, Youth and Sports (Edu-up system), the National Research Agency (ELEMENT project), and in partnership with Radio France.
      </Text>
    </View>
  );
}

