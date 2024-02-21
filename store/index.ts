import {
  Action,
  combineReducers,
  configureStore,
  ThunkAction,
} from '@reduxjs/toolkit';

import {
  createTransform,
  FLUSH,
  PAUSE,
  PERSIST,
  persistReducer,
  persistStore,
  PURGE,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist';

import storage from '@react-native-async-storage/async-storage';
import stateReconciler from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel2';

import settingsReducer from '../features/settings/settingsSlice';
import sensorsReducer from '../features/sensors/sensorsSlice';
import networkReducer from '../features/network/networkSlice';
import { CombinedSliceReducer } from '@reduxjs/toolkit/dist/combineSlices';

// console.log('[debug] clear storage');
// storage.clear();

const settingsTransform = createTransform(

  // transform state on its way to being serialized and persisted.
  (inboundState: any) => {
    const transformedState = { ...inboundState };

    // // do not store oscEnabled and webSocketEnabled
    // // (copy to avoid state mutation)
    // const { oscEnabled, webSocketEnabled, ...rest } = transformedState.data;
    // transformedState.data = rest;

    return transformedState;
  },

  // transform state being rehydrated
  (outboundState: any) => {
    const transformedState = { ...outboundState };

    // // do no restore oscEnabled and webSocketEnabled
    // // (copy to avoid state mutation)
    // if (transformedState && transformedState.data) {
    //   // enforce values
    //   transformedState.data.oscEnabled = false;
    //   transformedState.data.webSocketEnabled = false;
    // }

    return transformedState;
  },

  // apply this transform to 'settings' only.
  { whitelist: ['settings'] }
);

const rootPersistConfig = {
  key: 'root',
  storage,
  stateReconciler,
  blacklist: ['sensors', 'network'],
  transforms: [settingsTransform],
};

const rootReducer = combineReducers({
  sensors: sensorsReducer,
  settings: settingsReducer,
  network: networkReducer,
});

const rootPersistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: rootPersistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: {
      //ignore persistence actions
      ignoredActions: [
        FLUSH,
        REHYDRATE,
        PAUSE,
        PERSIST,
        PURGE,
        REGISTER
      ],
    },
  }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;
