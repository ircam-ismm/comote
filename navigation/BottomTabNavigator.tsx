/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import {
  AntDesign, // QR-code
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import QRScreen from '../screens/QRScreen';
import SettingsScreen from '../screens/SettingsScreen';
import DebugScreen from '../screens/DebugScreen';
import PlayScreen from '../screens/PlayScreen';

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

  // warning: open PlayScreen to initialise
  return (
    <BottomTab.Navigator
      initialRouteName="Play"
      screenOptions={{
        activeTintColor: Colors[colorScheme].tint,
        headerShown: false,
      }}>

      <BottomTab.Screen
        name="QR"
        component={QRNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="qrcode" size={24} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="setting" size={24} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Debug"
        component={DebugNavigator}
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="bug" size={24} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Play"
        component={PlayNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="shake" size={24} color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab

// seems to better handle camera disconnection and re-connection
const QRStack = createNativeStackNavigator<QRParamList>();

function QRNavigator() {
  return (
    <QRStack.Navigator>
      <QRStack.Screen
        name="QRScreen"
        component={QRScreen}
        options={{
          headerTitle: 'Scan QR Code',
        }}
      />
    </QRStack.Navigator>
  );
}

const SettingsStack = createNativeStackNavigator<SettingsParamList>();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{headerTitle: 'Settings'}}
      />
    </SettingsStack.Navigator>
  );
}

const DebugStack = createNativeStackNavigator<DebugParamList>();

function DebugNavigator() {
  return (
    <DebugStack.Navigator>
      <DebugStack.Screen
        name="DebugScreen"
        component={DebugScreen}
        options={{headerTitle: 'Debug'}}
      />
    </DebugStack.Navigator>
  );
}

const PlayStack = createNativeStackNavigator<PlayParamList>();

function PlayNavigator() {
  return (
    <PlayStack.Navigator>
      <PlayStack.Screen
        name="PlayScreen"
        component={PlayScreen}
        options={{headerTitle: 'Play'}}
      />
    </PlayStack.Navigator>
  );
}
