import i18n from "i18next";
import en from "./i18n/en.json";
import ja from "./i18n/ja.json";
import zhCN from "./i18n/zh-CN.json";
import zhTW from "./i18n/zh-TW.json";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
    en: {
        translation: en,
    },
    ja: {
        translation: ja,
    },
    "zh-CN": {
        translation: zhCN,
    },
    "zh-TW": {
        translation: zhTW,
    },
};

const DETECTION_OPTIONS = {
    order: ["localStorage", "navigator"],
    caches: ["localStorage"],
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        detection: DETECTION_OPTIONS,
        fallbackLng: "en",
        lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
        // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
    });

export default i18n;
