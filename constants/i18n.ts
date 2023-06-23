import { I18n } from 'i18n-js';

import en from './i18n/en';
import fr from './i18n/fr';
import it from './i18n/it';

export const translations  = {
  en,
  fr,
  it,
};

export const i18n = new I18n(translations);

export default i18n;