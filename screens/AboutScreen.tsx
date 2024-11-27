import * as React from 'react';
import * as Linking from 'expo-linking';
import * as Application from 'expo-application';
import i18n from '../constants/i18n';

import {
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Text, View } from '../components/Themed';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { useAppSelector } from '../hooks';


export default function AboutScreen({ color, navigation }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 16,
      justifyContent: 'space-between',
      flexDirection: 'column',
      backgroundColor: colors.background,

      // borderWidth: 5,
      // borderColor: 'red',
    },

    subcontainer: {
      alignSelf: 'center',
      flexDirection: 'row',
      flexWrap: "wrap",
      alignItems: 'center',
      justifyContent: 'flex-center',
      marginVertical: 8,
      backgroundColor: colors.background,


      // borderColor: 'green',
      // borderWidth: 5,
    },

    textContainer: {
      justifyContent: 'flex-start',
    },

    paragraph: {
      marginBottom: 16,
    },

    logosContainer: {
      maxWidth: '100%',
      maxHeight: '50%',

      // borderColor: 'purple',
      // borderWidth: 5,
    },

    logo: {
      maxWidth: '100%',
      maxHeight: '100%',
      // height: undefined,
      aspectRatio: 3,
      resizeMode: 'contain',

      // borderColor: 'blue',
      // borderWidth: 5,
    },

    button: {
      alignItems: "center",
      padding: 16,
      borderRadius: 4,
      alignSelf: 'stretch'
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.subcontainer, styles.textContainer]}>
        <Text style={styles.paragraph}>
          {i18n.t('about.developedBy')}
        </Text>
        <Text style={styles.paragraph}>
          {i18n.t('about.producedBy')}
        </Text>
        <Text style={styles.paragraph}>
          {i18n.t('about.producedByUntil12')}
        </Text>

        <Text>
            {Application.applicationName} {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
        </Text>
      </View>

      <View style={styles.subcontainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.genericButton }]}
          onPress={() => {
            Linking.openURL(i18n.t('about.privacyPolicyLink'));
          }}
        >
          <Text style={{ color: 'white' }}>{i18n.t('about.privacyPolicy')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[
        styles.subcontainer,
        styles.logosContainer,
        { backgroundColor: Colors.light.background },
      ]}>
        <Image
          style={styles.logo}
          source={require('../assets/images/logos.png')}
        />
      </View>
    </ScrollView>
  );
}

