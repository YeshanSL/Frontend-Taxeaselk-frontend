"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TranslationKey } from "@/lib/i18n/translations";

// Drop this into any Server Component page to render a translated
// string without converting the whole page to a Client Component —
// e.g. <h1><T k="pages.documents.title" /></h1>. Only this small piece
// re-renders when the language changes.
export default function T({ k }: { k: TranslationKey }) {
  const { t } = useLanguage();
  return <>{t(k)}</>;
}
