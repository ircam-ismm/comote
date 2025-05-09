/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Platform } from 'react-native';

import {
  AntDesign, // QR-code
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';

import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import i18n from '../constants/i18n';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import QRScreen from '../screens/QRScreen';
import AboutScreen from '../screens/AboutScreen';
import WebViewScreen from '../screens/WebViewScreen';
// import DebugScreen from '../screens/DebugScreen';


import {
  HomeParamList,
  WebViewParamList,
  SettingsParamList,
  QRParamList,
  AboutParamsList,
  BottomTabParamList,
  DebugParamList,
 } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  return (
    <BottomTab.Navigator
      initialRouteName="Home"

      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tabIconSelected,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: Colors[colorScheme].tabIconBackground,
        },
        tabBarLabelStyle: {
          fontSize: Platform.OS === 'ios' ? 12 : 12,
        },
      }}>

      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: i18n.t('nav.home'),
          tabBarIcon: ({ color }) => <AntDesign name="home" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="WebView"
        component={WebViewNavigator}
        options={{
          tabBarLabel: i18n.t('nav.webview'),
          tabBarIcon: ({ color }) => <AntDesign name="plussquareo" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: i18n.t('nav.settings'),
          tabBarIcon: ({ color }) => <AntDesign name="setting" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="QRCode"
        component={QRNavigator}
        options={{
          tabBarLabel: i18n.t('nav.qrcode'),
          tabBarIcon: ({ color }) => <AntDesign name="qrcode" size={26} color={color} />,
        }}
      />

      <BottomTab.Screen
        name="About"
        component={AboutNavigator}
        options={{
          tabBarLabel: i18n.t('nav.about'),
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

const HomeStack = createNativeStackNavigator<HomeParamList>();

function HomeNavigator() {
  const colorScheme = useColorScheme();

  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{
          headerTitle: i18n.t('home.header'),
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerShadowVisible: true, // bottom border
        }}
      />
    </HomeStack.Navigator>
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
          headerTitle: i18n.t('settings.header'),
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
          headerTitle: i18n.t('qrcode.header'),
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerShadowVisible: true, // bottom border
        }}
      />
    </QRStack.Navigator>
  );
}

const WebViewStack = createNativeStackNavigator<WebViewParamList>();

function WebViewNavigator() {
  const colorScheme = useColorScheme();

  return (
    <WebViewStack.Navigator>
      <WebViewStack.Screen
        name="WebViewScreen"
        component={WebViewScreen}
        options={{
          headerShown: false,
          headerTitle: i18n.t('webview.header'),
          headerStyle: {
            backgroundColor: Colors[colorScheme].background,
          },
          headerShadowVisible: true, // bottom border
        }}
      />
    </WebViewStack.Navigator>
  );
}


const AboutStack = createNativeStackNavigator<AboutParamList>();

function AboutNavigator() {
  const colorScheme = useColorScheme();

  return (
    <AboutStack.Navigator>
      <AboutStack.Screen
        name="AboutScreen"
        component={AboutScreen}
        options={{
          headerTitle: i18n.t('about.header'),
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

