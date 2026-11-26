import en from "./dictionaries/en";
import es from "./dictionaries/es";
import de from "./dictionaries/de";
import type { Locale } from "./config";

const dictionaries = { en, es, de };
export const getDictionary = (locale: Locale) => dictionaries[locale] ?? en;
export type { Dictionary } from "./dictionaries/en";
