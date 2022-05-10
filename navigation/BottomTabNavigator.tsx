/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import {
  AntDesign, // QR-code
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import QRScreen from '../screens/QRScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DebugScreen from '../screens/DebugScreen';
import PlayScreen from '../screens/PlayScreen';
import HomeScreen from '../screens/HomeScreen';

import NetworkComponent from '../components/NetworkComponent';

import {
  BottomTabParamList,
  QRParamList,
  SettingsParamList,
  DebugParamList,
  PlayParamList,
 } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"

      screenOptions={{
        activeTintColor: Colors[colorScheme].tabIconSelected,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 8,
          backgroundColor: Colors[colorScheme].tabIconBackground,
        },
      }}>

      <BottomTab.Screen
        name="Play"
        component={PlayNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="shake" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="setting" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="QR"
        component={QRNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="qrcode" size={26} color={color} />,
        }}
      />

      {/* this one is not shown */}
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarItemStyle: { display: 'none' },
        }}
      />

      {/*<BottomTab.Screen
        name="Debug"
        component={DebugNavigator}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="bug" size={26} color={color} />,
        }}
      />*/}
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

// seems to better handle camera disconnection and re-connection
const QRStack = createNativeStackNavigator<QRParamList>();

function QRNavigator() {
  const colorScheme = useColorScheme();

  return (
    <QRStack.Navigator>
      <QRStack.Screen
        name="QRScreen"
        component={QRScreen}
        options={{
          headerTitle: 'Scan QR Code',
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
          headerShadowVisible: false, // remove bottom border
        }}
      />
    </QRStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsParamList>();

function SettingsNavigator() {
  const colorScheme = useColorScheme();

  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          headerTitle: 'Settings',
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
          headerShadowVisible: false, // remove bottom border
        }}
      />
    </SettingsStack.Navigator>
  );
}

const PlayStack = createNativeStackNavigator<PlayParamList>();

function PlayNavigator() {
  const colorScheme = useColorScheme();

  return (
    <PlayStack.Navigator>
      <PlayStack.Screen
        name="PlayScreen"
        component={PlayScreen}
        options={{
          headerTitle: 'Play',
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 24,
          },
          headerShadowVisible: false, // remove bottom border
        }}
      />
    </PlayStack.Navigator>
  );
}

function HomeNavigator() {
  const colorScheme = useColorScheme();

  return (
    <PlayStack.Navigator>
      <PlayStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </PlayStack.Navigator>
  );
}

// const DebugStack = createNativeStackNavigator<DebugParamList>();

// function DebugNavigator() {
//   return (
//     <DebugStack.Navigator>
//       <DebugStack.Screen
//         name="DebugScreen"
//         component={DebugScreen}
//         options={{headerTitle: 'Debug'}}
//       />
//     </DebugStack.Navigator>
//   );
// }

