# reCoMote

## Development

### Installation
Install `Node.js`. Prefer the long-term support (LTS) version, at least v14.

Install (or update) `npm`, `yarn` and `expo-cli` globally.

```sh
npm -g install npm yarn expo-cli
```

Install project dependencies with `yarn`.

```sh
yarn install
```

#### [deprecated]

> Run project with `expo`.
> 
> ```sh
> expo start
> ```
> 
> Install 'Expo Go' on iOS and Android devices.
> 
> - on iOS, flash development QR code from Camera app,
> - on Android, open 'Expo Go' to flash the development QR code.
> - while running app, shake the device on the left or on the right to access the debugger

### Android and iOS Build tools

As we are using `react-native-udp` which is not included in expo-go, we must create
a custom development build that include the binaries from `react-native-udp`.

cf. https://docs.expo.dev/development/introduction/

Therefore we need the build tools for android (Android Studio) and iOS (XCode)

#### Android notes

The build tools require the Java JDK 8, cf. :
https://stackoverflow.com/questions/24342886/how-to-install-java-8-on-mac
https://medium.com/@devkosal/switching-java-jdk-versions-on-macos-80bc868e686a

For local builds, The paths to the Android SDK must be registered in `eas.json` for each 
build channel, i.e.:

```json
"build": {
  "development": {
    "developmentClient": true,
    "distribution": "internal",
    "android": {
      "buildType": "apk"
    },
    "env": {
      "ANDROID_SDK_ROOT": "/Users/matuszewski/Library/Android/sdk"
    }
  },
},
```

in `~/.bash_profile`, we should also something like to access `adb` (and probably other things...):

```
# android studio tools
export JAVA_HOME=`/usr/libexec/java_home -v 1.8` # use Java 8
export ANDROID_SDK=/Users/username/Library/Android/sdk
export PATH=/Users/username/Library/Android/sdk/platform-tools:$PATH
```

### Build and deploy

To build, install `eas-cli`. See <https://docs.expo.dev/eas/>

```sh
npm -g install `eas-cli`
```

Then build with `eas`. You will need to register on <expo.dev> website.

In android, creating a development build can be either:

1. using expo

```
eas build --profile development --platform android
```

However, it seems that the build cannot be directly installed on the phone through the 
QRCode, therefore the `.apk` file should be first downloaded on your computer and then 
installed on the device using `adb install whateverbuildname.apk` as if it was built locally

2. or Locally

```
eas build --local --profile development --platform android
```

On iOS -> @todo

It is even possible to publish to stores.

```sh
eas publish
```

### Build preview

#### online build
```
eas build -p android --profile preview
```
#### local build
```
eas build --local --profile preview --platform android
```


### Message format

#### WebSocket
```
e = {
  source: 'comote',
  id: 42,
  devicemotion: {
    interval // ms
    accelerationIncludingGravity = { x, y, z } // m/s2
    rotationRate = { alpha, beta, gamma } // deg/s
  },
}

e = {
  source: 'comote',
  id: 42,
  buttonA: 0 | 1
}

e = {
  source: 'comote',
  id: 42,
  buttonB: 0 | 1
}
```

#### OSC format

```
/comote/${id}/devicemotion  [interval, x, y, z, alpha, beta, gamma]
/comote/${id}/buttonA       [buttonA]
/comote/${id}/buttonB       [buttonA]
```

### TODO

#### Target v1 - 15-20 may


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

- [ ] allow to lock all interactions on play screen (sse https://reactnative.dev/docs/modal)

- [ ] rename to `CoMo.te`

#### v2 features

- [ ] check https://www.npmjs.com/package/@react-native-community/netinfo
- [ ] dynaically find available port for OSC/UDP socket

#### Stores
- [ ] register `fr.ircam.ismm.recomote`

##### Project
- [ ] name -> rename to `CoMo-te` ? (see stores)
- [ ] icons -> to review
- [ ] colours
- [x] add info tab

#### App

- [ ] binary webSocket
- [ ] try to automatically reconnect on `close` and `error`
  - [ ] server comes after app
  - [ ] connection interrupted

- [ ] performance on Android v8
  - [ ] debug screen crashes
  - [ ] overload if accelerometer frequency is more than 40 Hz
  - [ ] test on more recent Android

- [ ] bypass redux store for sensors stream
  - [ ] global stream data
  - [ ] periodic transmit
  - [ ] be sure to keep events of buttons in order

- [ ] multi-touch support for buttons
- [ ] add 2D touch support

- [ ] centralise styles


- [ ] OSC
- [ ] other sensors

#### CoMo-Vox

- [ ] webSocket input
- [ ] server QR code generator (settings to URL)
