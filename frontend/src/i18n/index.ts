import { en } from './en';
import { kn } from './kn';
import { hi } from './hi';
import { Language } from '../types';

export const translations = {
  en,
  kn,
  hi
};

export const getTranslation = (lang: Language) => {
  return translations[lang] || translations.en;
};
