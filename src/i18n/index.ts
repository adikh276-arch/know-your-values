import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";
import de from "./locales/de.json";
import ar from "./locales/ar.json";
import hi from "./locales/hi.json";
import bn from "./locales/bn.json";
import zh from "./locales/zh.json";
import ja from "./locales/ja.json";
import id from "./locales/id.json";
import tr from "./locales/tr.json";
import vi from "./locales/vi.json";
import ko from "./locales/ko.json";
import ru from "./locales/ru.json";
import it from "./locales/it.json";
import pl from "./locales/pl.json";
import th from "./locales/th.json";
import tl from "./locales/tl.json";

const resources = {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    pt: { translation: pt },
    de: { translation: de },
    ar: { translation: ar },
    hi: { translation: hi },
    bn: { translation: bn },
    zh: { translation: zh },
    ja: { translation: ja },
    id: { translation: id },
    tr: { translation: tr },
    vi: { translation: vi },
    ko: { translation: ko },
    ru: { translation: ru },
    it: { translation: it },
    pl: { translation: pl },
    th: { translation: th },
    tl: { translation: tl },
};

// Get language from URL parameter ?lang=
const urlParams = new URLSearchParams(window.location.search);
const langParam = urlParams.get("lang");

// Get language from localStorage
const storedLang = localStorage.getItem("language");

// Priority: URL param > localStorage > default English
const initialLang = langParam || storedLang || "en";

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: initialLang,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false,
        },
    });

// Save language preference to localStorage when it changes
i18n.on("languageChanged", (lng) => {
    localStorage.setItem("language", lng);
});

export default i18n;
