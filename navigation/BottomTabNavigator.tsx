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

import HomeScreen from '../screens/HomeScreen';
import PlayScreen from '../screens/PlayScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QRScreen from '../screens/QRScreen';
import AboutScreen from '../screens/AboutScreen';
// import DebugScreen from '../screens/DebugScreen';

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
      // initialRouteName="Play"

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
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="home" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Play"
        component={PlayNavigator}
        options={{
          // tabBarIcon: ({ color }) => <AntDesign name="shake" size={26} color={color} />,
          tabBarIcon: ({ color }) => <AntDesign name="playcircleo" size={26} color={color} />,
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
        name="QR Code"
        component={QRNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="qrcode" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="About"
        title="About CoMo(te)"
        component={AboutNavigator}
        options={{
          tabBarIcon: ({ color }) => <AntDesign name="infocirlceo" size={26} color={color} />,
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

const HomeStack = createNativeStackNavigator<PlayParamList>();

function HomeNavigator() {
  const colorScheme = useColorScheme();

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
    </HomeStack.Navigator>
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
          headerShadowVisible: true, // bottom border
        }}
      />
    </PlayStack.Navigator>
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
          headerShadowVisible: true, // bottom border
        }}
      />
    </SettingsStack.Navigator>
  );
}

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
          headerShadowVisible: true, // bottom border
        }}
      />
    </QRStack.Navigator>
  );
}

const AboutStack = createNativeStackNavigator<PlayParamList>();

function AboutNavigator() {
  const colorScheme = useColorScheme();

  return (
    <AboutStack.Navigator>
      <AboutStack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{
          headerTitle: 'About CoMo(te)',
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerShadowVisible: true, // bottom border
        }}
      />
    </AboutStack.Navigator>
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

