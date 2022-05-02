import { StyleSheet, Button } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootTabScreenProps } from '../types';

import * as Linking from 'expo-linking';

import { useAppSelector, useAppDispatch } from '../hooks';
import { selectSensors } from '../features/sensors/sensorsSlice';

// function openUrl() {

  // const url = 'recomote://?ws=false&ws-url=wss://129.102.165.35:8888&osc=false&osc-url=udp://128.102.165.32:5555';

//   // adapt URL to development environment
//   const url = Linking.createURL('/settings', {
//     queryParams: {
//       'ws': 'false',
//       'ws-url': 'ws://129.102.165.35:8888',
//       'osc': 'false',
//       'osc-url': 'udp://128.102.165.32:5555',
//     },
//   });

//   Linking.openURL(url);
// }

      // <View style={{display: ''}}>
      //   <Text>
      //     x: {accelerometer.x.toFixed(2)}
      //     y: {accelerometer.y.toFixed(2)}
      //     z: {accelerometer.z.toFixed(2)}
      //   </Text>
      // </View>
export default function DebugScreen({ navigation }: RootTabScreenProps<'Debug'>) {
    const sensors = useAppSelector( (state) => {
    return selectSensors(state);
  });
  const {accelerometer} = sensors;

  return (
    <View style={styles.container}>

      <View style={{display: ''}}>
        <Text>
          x: {accelerometer.x.toFixed(2)}
          y: {accelerometer.y.toFixed(2)}
          z: {accelerometer.z.toFixed(2)}
        </Text>
      </View>

      <Button title={'Open dynamic URL'} onPress={() => {
        const url = Linking.createURL('/settings', {
          queryParams: {
            'ws': 'true',
            'ws-url': 'ws://10.10.0.1:8001',
            'osc': 'false',
            'osc-url': 'udp://10.10.0.2:8002',
          },
        });

        Linking.openURL(url);
      }} />

      <Button title={'Disable WebSocket'} onPress={() => {
        const url = Linking.createURL('/settings', {
          queryParams: {
            'ws': 'false',
          },
        });

        Linking.openURL(url);
      }} />

      <Button title={'Enable WebSocket'} onPress={() => {
        const url = Linking.createURL('/settings', {
          queryParams: {
            'ws': 'false',
          },
        });

        Linking.openURL(url);
      }} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
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
