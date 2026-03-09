import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_KEY = 'AIzaSyDgyWwwmHOROsPZclCm-LGzZs_uoYNhVDk';
const BASE_LANG = 'en';
const TARGET_LANGS = [
    'es', 'fr', 'pt', 'de', 'ar', 'hi', 'bn', 'zh-CN', 'ja',
    'id', 'tr', 'vi', 'ko', 'ru', 'it', 'pl', 'th', 'tl'
];

const LOCALES_DIR = path.resolve(__dirname, '../src/i18n/locales');
const EN_PATH = path.join(LOCALES_DIR, 'en.json');

async function translate(text: string, targetLang: string): Promise<string> {
    if (!text || typeof text !== 'string' || text.trim() === '') return text;
    try {
        const response = await axios.post(
            `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
            {
                q: text,
                target: targetLang,
                source: BASE_LANG,
            }
        );
        return response.data.data.translations[0].translatedText;
    } catch (error: any) {
        console.error(`Error translating to ${targetLang}:`, error.response?.data || error.message);
        return text;
    }
}

async function translateObject(obj: any, targetLang: string): Promise<any> {
    const result: any = {};
    for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            result[key] = await translateObject(obj[key], targetLang);
        } else if (typeof obj[key] === 'string') {
            result[key] = await translate(obj[key], targetLang);
        } else {
            result[key] = obj[key];
        }
    }
    return result;
}

async function main() {
    if (!fs.existsSync(EN_PATH)) {
        console.error('en.json not found!');
        return;
    }

    const enContent = JSON.parse(fs.readFileSync(EN_PATH, 'utf-8'));

    for (const lang of TARGET_LANGS) {
        console.log(`Generating translations for ${lang}...`);
        const translated = await translateObject(enContent, lang);
        const fileName = lang === 'zh-CN' ? 'zh.json' : `${lang}.json`;
        const outputPath = path.join(LOCALES_DIR, fileName);
        fs.writeFileSync(outputPath, JSON.stringify(translated, null, 2), 'utf-8');
        console.log(`Saved ${fileName}`);
    }

    console.log('All translations generated successfully!');
}

main();
