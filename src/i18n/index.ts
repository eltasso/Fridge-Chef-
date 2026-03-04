import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import es from './es';
import en from './en';

export const i18n = new I18n({ es, en });

i18n.defaultLocale = 'es';
i18n.enableFallback = true;

const deviceLocale = getLocales()[0]?.languageCode ?? 'es';
i18n.locale = deviceLocale.startsWith('en') ? 'en' : 'es';

export type TranslationKey = string;
