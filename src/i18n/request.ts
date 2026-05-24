import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages } from "next-intl";

import en from "../../messages/en.json";
import uk from "../../messages/uk.json";

export const defaultLocale = "uk";
export const locales = ["uk", "en"] as const;

export type Locale = (typeof locales)[number];

const messagesByLocale = {
  uk,
  en,
} satisfies Record<Locale, AbstractIntlMessages>;

export default getRequestConfig(async () => {
  const locale = defaultLocale;

  return {
    locale,
    messages: messagesByLocale[locale],
  };
});
