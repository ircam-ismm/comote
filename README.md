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

Run project with `expo`.

```sh
expo start
```

Install 'Expo Go' on iOS and Android devices.

- on iOS, flash development QR code from Camera app,
- on Android, open 'Expo Go' to flash the development QR code.
- while running app, shake the device on the left or on the right to access the debugger

### Buid and deploy

To build, install `eas-cli`. See <https://docs.expo.dev/eas/>

```sh
npm -g install `eas-cli`
```

Then build with `eas`. You will need to register on <expo.dev> website.

```sh
eas build
```

It might be easier to use the old build

```sh
expo build:android
expo build:ios
```

It is even possible to publish to stores.

```sh
eas publish
```

### Build preview

```
expo start --no-dev --minify
```

```
eas build -p android --profile preview
```

### Message format


WebSocket
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

OSC format

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

- [ ] OSC client
  + we can't use expo go anymore and need to go to development builds
  + https://docs.expo.dev/development/introduction/
  + for a bit of context
  + https://expo.canny.io/feature-requests/p/support-raw-tcp-sockets 
  + https://forums.expo.dev/t/using-udp-within-expo/1411/8
  + https://www.sitepen.com/blog/doing-more-with-expo-using-custom-native-code
  
  create development build (can be done in eas):
  `eas build --profile development --platform android`
  then this is done, we should be able to:
  `expo start --dev-client`

  `eas build --local --profile development --platform android`

install Java JDK 8
https://stackoverflow.com/questions/24342886/how-to-install-java-8-on-mac
https://medium.com/@devkosal/switching-java-jdk-versions-on-macos-80bc868e686a

  for Android - install JDK
  https://www.oracle.com/java/technologies/downloads/#jdk18-mac


- [ ] allow to lock interactions on play screen (sse https://reactnative.dev/docs/modal)
- [ ] id as string
- [ ] remove `sampleRate` in favor of `period`
- [ ] info connection on play page
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
