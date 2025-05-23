import {
  createSlice,
  createAsyncThunk,
  createAction,
  Action,
  AnyAction,
  PayloadAction,
} from '@reduxjs/toolkit';

import slugify from 'slugify';

import type { RootState, AppThunk } from '../../store';

import stringIsNumeric from '../../helpers/stringIsNumeric.js';
import { apiStringToVersion } from '../../helpers/api.js';

interface SettingsState {
  data: any;
  status: 'idle' | 'loading' | 'error';
}

const initialState = {
  data: {
    id: '0',
    sensorsInterval: 10,  // in ms
    webSocketEnabled: false,
    webSocketUrl: null,
    oscEnabled: false,
    oscUrl: null,
    webviewContent: null,
    outputApi: 'v3',
  },
  status: 'idle',
} as SettingsState;

interface RejectedAction extends Action {
  error: Error
}

function isRejectedAction(action: AnyAction): action is RejectedAction {
  return action.type.endsWith('rejected')
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<any>) => {
      Object.assign(state.data, action.payload);

      // replace empty value, undefined, NaN, or 0, with default value
      if (state.data.sensorsInterval < 0
        || Number.isNaN(state.data.sensorsInterval)
      ) {
        state.data.sensorsInterval = initialState.data.sensorsInterval;
      }

      const outputApiVersion = apiStringToVersion(state.data.outputApi);
      if (outputApiVersion < 2) {
        state.data.outputApi = initialState.data.outputApi;
      }

      // make sure we don't have garbage in id, as it used for OSC addresses
      state.data.id = slugify(state.data.id, {
        replacement: '-',  // replace spaces with replacement character, defaults to `-`
        lower: true,      // convert to lower case, defaults to `false`
        strict: true,     // strip special characters except replacement, defaults to `false`
      });

      // Be sure that protocol is in lower-case to avoid crash on android.
      // NetworkComponent later does URL verification
      if (typeof state.data.webSocketUrl === 'string') {
        const splitted = state.data.webSocketUrl.split('://');

        if (splitted && splitted.length > 1 && typeof splitted[0] === 'string') {
          splitted[0] = splitted[0].toLowerCase();
          state.data.webSocketUrl = splitted.join('://');
        }
      }

      if (typeof state.data.oscUrl === 'string') {
        const splitted = state.data.oscUrl.split('://');

        if (splitted && splitted.length > 1 && typeof splitted[0] === 'string') {
          splitted[0] = splitted[0].toLowerCase();
          state.data.oscUrl = splitted.join('://');
        }
      }

      if (state.data.webviewContent && state.data.webviewContent.trim() === '') {
        state.data.webviewContent = null;
      }
    },
  },

  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addMatcher(isRejectedAction,
        // `action` will be inferred as a RejectedAction due to
        // isRejectedAction being defined as a type guard
        (state: SettingsState, action) => {
          state.status = 'error';
        }
      )
      // and provide a default case if no other handlers matched
      .addDefaultCase((state, action) => { });
  },
});

export const {
  set,
} = settingsSlice.actions;

// The function below is called a selector and allows us to select a data from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file.
export const selectSettings = (state: RootState) => {
  return state.settings.data;
}

export const selectSensorsInterval = (state: RootState) => {
  return state.settings.data.sensorsInterval;
}

export default settingsSlice.reducer;
