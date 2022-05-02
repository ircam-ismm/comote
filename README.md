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

### Buid and deploy

To build, install `eas-cli`. See <https://docs.expo.dev/eas/>

```sh
npm -g install `eas-cli`
```

Then build with `eas`.

```sh
eas build
```

It is even possible to publish to stores.

```sh
eas publish
```

### TODO

-
- [ ] name
  - [ ] reCoMote
  - [ ] recomote
  - [ ] Recomote
- [ ] icons
- [ ] colours

- [ ] binary webSocket
- [ ] server QR code generator (settings to URL)
- [ ] multi-touch buttons
- [ ] performance on Android
  - [ ] debug screen crashes
  - [ ] bypass store for sensors stream
