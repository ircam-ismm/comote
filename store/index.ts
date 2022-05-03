import {
  Action,
  combineReducers,
  configureStore,
  getDefaultMiddleware,
  ThunkAction,
} from '@reduxjs/toolkit';

import {
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

const persistConfig = {
  key: 'root',
  storage,
  stateReconciler,
  blacklist: ['sensors', 'network']
};

const reducers = combineReducers({
  sensors: sensorsReducer,
  settings: settingsReducer,
  network: networkReducer,
});

const persistedReducer = persistReducer(persistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware({
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
