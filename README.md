# CoMote

## Development

### Installation
Install `Node.js`. Prefer the long-term support (LTS) version, at least v16.

Install (or update) `npm`, `yarn` and `eas-cli` globally.

```sh
npm -g install npm yarn eas-cli
```

Install project dependencies with `yarn`.

```sh
yarn install
```

Tested with:
- node 20
- java 17
- npx expo (locally installed in project, not global, also called "versioned expo")

### Android and iOS Build tools

As we are using `react-native-udp` which is not included in expo-go, we must create
a custom development build that include the binaries from `react-native-udp`.

cf. https://docs.expo.dev/development/introduction/

Therefore we need the build tools for android (Android Studio) and iOS (XCode)

#### Android notes

##### Android SDK

Install Android studio. After installation, you can choose `More Actions` then `SDK Manager` to configure SDK tools and emulators.

- In `SDK Platforms`tab, you may need to install extensions `*-ext` for you current platform.

- In `SDK Tools`, install:
  - Command-line tools
  - You may need to instlal `NDK`, `CMake`



For local builds, The paths to the Android SDK must be registered in `eas.json` for each build channel, i.e.:

```json
"build": {
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    },
    "env": {
      "ANDROID_SDK_ROOT": "~/Library/Android/sdk"
    }
  },
},
```

In your profile we should also something like to access `adb` (and probably other things):

```bash
# android
export ANDROID_HOME="${HOME}/Library/Android/sdk"
if [ -d "$ANDROID_HOME" ] ; then
    export PATH="${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools"

    if [ -d "${ANDROID_HOME}/ndk" ] ; then
        android_ndk_version="$( basename "$(ls -d "${ANDROID_HOME}/ndk"/* | tail -1 )" )"
        export ANDROID_NDK_HOME="${ANDROID_HOME}/ndk/${android_ndk_version}"
    fi
fi
```

##### Java

The build tools require the Java JDK 17, cf. :
- <https://adoptium.net/fr/temurin/releases/>


Then select a version in you shell profile.
```bash
# android studio tools
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"
```

#### Apple Notes

##### Xcode

Install Xcode, and open it. Install iOS platform.

##### Dependencies

```sh
brew install fastlane
brew install cocoapods
```

Note: if you install native modules, you must install cocoapods again. One way is to run again `npx expo prebuild`.

##### Certificates

Notes:

- it might be easier to do deal with certificates with Xcode, and eas.
- you might need to be admin at <developer.apple.com>

Create a certificate signing request using Keychain.app <https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request>

Use it to create a new certificate from you Apple developer account. <https://developer.apple.com/account/resources/certificates/list>

You may also need to import distribution certificates from expo.dev
<https://expo.dev/accounts/ircam-ismm/settings/credentials>


See *[expo] fr.ircam.ismm.comote AdHoc 1674659444844 <https://developer.apple.com/account/resources/profiles/review/YKGSJK98F4>


### Local development and pre-build

Generate prebuild folders, named `ios` and `android`.

```sh
npx expo prebuild
```

If it does not build, you will need to remove the created folders.

```sh
rm -rf ios android
```

### Android

Generate development build.
```sh
eas build --local --profile development --platform android
```

Install on device.

You can use an http-server:
```sh
npm -g install http-server
http-server .
```
On device, open Google Chrome and type the URL given by the server. Download and install the apk.

You can also install via `adb`.
- plug the device
- trust the computer
- allow for file transfer from USB
- allow developer mode on device
- type `adb install build-latest.apk`

### iOS

Generate development build.
```sh
eas build --local --profile development --platform ios
```

Be sure to select the local devices allowed to install the app.

If it does not build, use xCode. In particular, check the signing capabilities.

```sh
xed ios
```

- plug your device
- trust the computer
- in xCode, select the device, then click `Run` to build, install, and run the application on the device
- click `Stop` to stop the application on the device

To install and run on an iOs simulator, repeat the xCode procedure (select a simulated device, then run and stop).


### Expo

Start expo. (The `--dev-client` unnecessary since expo 49.)
```sh
npx expo start
```

Expo-go must be installed on the device, but you should use the installed pre-built application.

Flash the QR-code to start the application:
- iOS: use the `Camera` app
- Android: use the `Expo-Go` app

Warning, if you use a local IP, you should generate an ad-hoc QR-code. Here is an exemple for `10.10.0.1`

```sh
npm -g install qrcode
qrcode 'exp+comote://expo-development-client/?url=http%3A%2F%2F10.10.0.1%3A8081'
```

You can enter URL manually in your development built app  `http://10.10.0.1:8081`


While running app, shake the device on the left or on the right to access the debugger. You can deactivate that in the menu, as you might want to shake the device. Then, type `m` in the console where you started expo to toggle the menu.

You can press `j` in the console to start a debugger.


### Pre-production test

The easiest way to simulate how your project will run on end users' devices is with the command:

```sh
npx expo start --no-dev --minify
```

However, this might no be enough, as the build is different. It notably differs when the app is suspended (move to background, device lock). Note the usage of the `--device` flag to be able to select a real device.

```sh
npx expo run:ios --configuration Release --device
```



### Build and deploy


```sh
yarn install
```


#### iOS

Build (online) and submit.
```sh
eas build --profile production --platform ios
eas submit --platform ios
```

If the submission fails, use the expo.dev website:
<https://expo.dev/accounts/ircam-ismm/projects/comote>


#### Android

Build (online) and submit.
```sh
eas build --profile production --platform android
eas submit --platform android
```

## Update

```sh
rm -rf yarn.lock node_modules
yarn install
yarn upgrade --latest
npx expo-doctor
npx expo install --fix
npx expo-doctor
rm -rf android ios
```

Prebuild and build again the development versions, to use with expo.

## Message format

### WebSocket
```js
e = {
  source: 'comote',
  id: 42,
  devicemotion: {
    interval, // ms
    accelerationIncludingGravity = { x, y, z }, // m/s2
    rotationRate = { alpha, beta, gamma }, // deg/s
  },
  magnetometer: {
    interval, // ms
    magnetometer = {x, y, z}, // uT
  },
  heading: {
    interval, // ms
    accuracy, // degrees or -1 of not available
    magnetometerHeading, // degrees
    trueHeading, // degrees or -1 if not available
  },
  control: {
    [key]: value,
    // e.g. `buttonA: 1,`
  }
}

```

### OSC format

```
/comote/${id}/devicemotion  [interval, x, y, z, alpha, beta, gamma]
/comote/${id}/magnetometer  [interval, x, y, z]
/comote/${id}/heading       [interval, accuracy, magnetometerHeading, trueHeading]
/comote/${id}/control/[key]       [value]
```

## TODO

### Target v2-beta - WebView

- [x] Unify message format for buttons
    + [x] osc `comote/${id}/control/${key} value` 
    + [x] ws  `control: { [key]: value }` 
- [x] Add QRcode `webview` key
    + [x] `url` if starts with `http`
    + [x] else `html`
- [x] add Setting field to configure `webview`
    + [x] `[HTML]` content if not URL
- [x] Store `webviewContent` (tbc)
- [x] WebView
    + [-] fallback in case of 404 error
    + [-] define what to do in case of invalid input
    -> let's just rely on default browser behavior
    + [x] timer for retry on load error
- [x] properly redirect `QRcode` to `Play` or `WebView`

- [ ] fix: webview should try reload only when screen is focused

### Target v2

- [ ] check https://www.npmjs.com/package/@react-native-community/netinfo
- [ ] multitouch support for buttons
- [ ] add 2D touch support (what does it mean?)
- [ ] add x/y pad (switch on play screen)?
- [ ] connect WiFi in QRCode?
- [ ] other sensors
- [x] follow Sensor API spec
- [ ] binary webSocket
- [ ] check sensors against MotionSender (iOS)

### Target v1.5

- [ ] Wait for next Expo version (50?) for background worker for engine (already in react-native v0.72)
    Cf. <https://reactnative.dev/docs/next/the-new-architecture/use-app-template>
    > If you're using Expo, you can't enable the New Architecture at the moment and will have to wait for a future release of the Expo SDK.

### Target v1.4 - September 2023

- [x] no more background image
- [x] OSC port and host
- [x] display sensors period in settings screen
- [x] float input for sensors rate
- [x] lock screen with playable buttons
- [ ] update Android version, as required by Google Play Store
- [ ] update Expo version

BUGS

- [ ] bad sample rate on first run of application (100 ms instead of 10 ms as displayed)
- [ ] wake-up lock does not work with iPhone XR and iOS 17.12

- [x] Any platform: check connection status
- [x] Any platform : change OSC port while connected: should reconnect
- [ ] Any platform: missing or late samples on touch screen events
  Wait for engine to run in background
- [x] iOS: after device sleep: sample period is 100ms
- [ ] iOS: not all sample period values allowed:
  - [ ] 5 ms is not possible, gives 10
  - [ ] 10 ms seems fine
  - [ ] 15 ms oscillates between 10 and 20
  - [ ] 20 ms seems fine
  - [ ] 30 ms oscillates between 20 and 40
  - [ ] 40 ms seems fine
  - [ ] keep:
     - 0 for auto
     - 10
     - 20
     - 40

- [ ] Android: sample period is a little more than specified
- [ ] every 5ms?
     - 0 for auto
     - 10 (request 9)
     - 20 (request 18)
     - 40 (request 38)

### Target v1.3 - June 2023

Rename CoMo.te to Comote:
- [x] Application
  - [x] texts
  - [ ] picture in welcome screen
- [ ] Ircam Forum
- [ ] Apple Store
   - [ ] text
   - [ ] screenshots
- [ ] Google Store
   - [ ] text
   - [ ] screenshots

- [x] do not bind udp socket: use automatic port
- [x] exclusive port
- [x] check OSC send on iOS
- [-] rotate sockets for quick send: no
- [x] async send (requestAnimationFrame or setTimeout), worker, queueMicrotask
  - [x] OSC
  - [-] WebBocket: not necessary
- [x] automatically reconnect server, when possible
- [x] check the use of React states in UseEffect functions, that need to be pure
- [x] do not resample (use sensors callback)
- [-] estimate sensors sample rate: jitter in JavaScript user code

### Target v1 - 15-20 May 2022

- [x] review icons and splash screen (make them brighter and more graphic)
- [x] allow to define an id on client
- [x] OSC configuration
- [-] use https://docs.expo.dev/versions/latest/sdk/devicemotion/ (broken)
- [x] review config to have only a global framerate
- [x] review message format
- [x] add gyroscope
- [x] update all settings from QRCode
- [x] Error screen if sensors are not available
- [x] OSC client
- [x] connection infos on play page
- [x] remove `sampleRate` in favor of `period`
- [x] id as string
- [x] allow to lock all interactions on play screen (sse https://reactnative.dev/docs/modal)
- [x] fix QR code
- [x] keep awake on play
- [x] rename to `CoMo.te`
- [x] register `fr.ircam.ismm.comote`
- [x] name -> rename to `CoMo-te` ? (see stores)
- [x] icons -> to review
- [x] colours
- [x] add info tab
- [x] performance on Android v8

- [x] i18n - at least french and english
- [x] review Home buttons, be consistent with the bottom menu

### JS helpers

See `comote-bench` project.

```
@ircam/comote-helpers
```

```
import { getWifiInfos, CoMoteServer } from '@ircam/comote-helpers/server.js';
await getWifiInfos() -> { ssid, ip }

new comote.Server(config, { verbose = false }) -> CoMoteServer {
  await start();
  await close();
  addListener(callback) -> () => removeEventListener(callback);
  removeListener();
};

// server + client
import { qrCode } from '@ircam/comote-helpers/qr-code.js';

qrCode.terminal(config);
qrCode.dataUrl(config);
```

### Max abstraction

jpatcher w/ jweb
