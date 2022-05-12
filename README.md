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

- [ ] OSC client
- [ ] Error screen if sensors are not available

- [ ] id as string
- [ ] info connection on play page
- [ ] rename to `CoMo.te`

#### Stores
- [ ] register `fr.ircam.ismm.recomote`

##### Project
- [ ] name -> rename to `CoMo-te` ? (see stores)
- [ ] icons -> to review
- [ ] colours
- [x] add info tab

#### App

- [ ] clients should have an id in their stream (default 0), so we can have multiple clients and route them
- [ ] OSC config
- [ ] review events format, proposal:

WebSocket
```
e = {
  id: 42,
  devicemotion: {
    interval // ms
    accelerationIncludingGravity = { x, y, z } // m/s2
    rotationRate = { alpha, beta, gamma } // deg/s
  },
}

e = {
  id: 42,
  buttonA: 0 | 1
}

e = {
  id: 42,
  buttonB: 0 | 1
}
```

OSC format

```
/comote/devicemotion  [id, interval, x, y, z, alpha, beta, gamma]
/comote/buttonA       [id, buttonA]
/comote/buttonB       [id, buttonA]
```

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
