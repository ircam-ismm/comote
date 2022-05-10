import * as React from 'react';

import {
  StyleSheet,
} from 'react-native';
import { Text, View } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export default function HomeScreen({ color, navigator }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      <View style={styles.buttonsContainer}>
        <Text style={styles.buttonText}
          selectable={false}
        >
          HOME
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: '100%',
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 16,
  },
});
