// ============================================================
//  config.js — данные и настройки
//  Когда будешь подключать Supabase:
//    1. Замени USE_MOCK на false
//    2. Вставь свои SUPABASE_URL и SUPABASE_KEY
// ============================================================

export const USE_MOCK = true; // true = данные из этого файла, false = Supabase

export const SUPABASE_URL = 'ВСТАВЬ_СЮДА_URL_ИЗ_SUPABASE';
export const SUPABASE_KEY = 'ВСТАВЬ_СЮДА_ANON_KEY_ИЗ_SUPABASE';

// ---- Данные артистов (используются пока USE_MOCK = true) ----
export const mockArtists = [
    {
        name: "Pussykiller",
        img: "https://sun9-24.vkuserphoto.ru/s/v1/ig2/6C_Y4iNdHRUEOTyoZznezRjHJCy-Ejq8BpF5LgTrkfQveP4hmIXy_392B-6rIibYfrDO5_oYK_AVJg5qlCzsN2N0.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080&from=bu&cs=1080x0"
    },
    {
        name: "Я про рок",
        img: "https://sun9-55.vkuserphoto.ru/s/v1/ig2/92qUFajamFNXNWcTSGBzmTh8kOtAJYJj39ZrQDO4tg-qmlk1cVMee1ThJahYoq_PHpAXTJtYSduK21YI86Veo98Q.jpg?quality=95&as=32x35,48x52,72x78,108x117,160x173,240x260,360x389,480x519,540x584,640x692,720x779,836x904&from=bu&cs=836x0"
    },
    {
        name: "White Gallows",
        img: "https://sun9-53.vkuserphoto.ru/s/v1/ig2/_eZ8hJvlB5h-0ckNZ99RklPmMgfL7-cDR_8qcH3gqvjxdw2JQeFWHm8Q86cOBjZXMKoHxCuxVpO3n1iFbKQQys7s.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&cs=2560x0"
    }
];
