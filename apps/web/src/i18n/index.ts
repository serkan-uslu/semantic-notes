import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// ─── English ──────────────────────────────────────────────────────────────────
import enCommon from '@/i18n/locales/en/common.json'
import enEditor from '@/i18n/locales/en/editor.json'
import enAgent from '@/i18n/locales/en/agent.json'
import enSettings from '@/i18n/locales/en/settings.json'

// ─── Turkish ─────────────────────────────────────────────────────────────────
import trCommon from '@/i18n/locales/tr/common.json'
import trEditor from '@/i18n/locales/tr/editor.json'
import trAgent from '@/i18n/locales/tr/agent.json'
import trSettings from '@/i18n/locales/tr/settings.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'tr'],
    defaultNS: 'common',
    ns: ['common', 'editor', 'agent', 'settings'],
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common: enCommon,
        editor: enEditor,
        agent: enAgent,
        settings: enSettings,
      },
      tr: {
        common: trCommon,
        editor: trEditor,
        agent: trAgent,
        settings: trSettings,
      },
    },
  })

export default i18n
