// ============================================================
//  config.js — данные и настройки
// ============================================================

// МЫ ПОМЕНЯЛИ TRUE НА FALSE! Теперь сайт знает, что нужно идти в Supabase
export const USE_MOCK = false; 

// Твои ключи доступа к базе данных
export const SUPABASE_URL = 'https://tazsewyhrqncymqwqffb.supabase.co';
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhenNld3locnFuY3ltcXdxZmZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTE4MzEsImV4cCI6MjA4NzY4NzgzMX0.6epTAUZAcbgT9FTvYyPEXGafbdOSyU4pTdm2ILRIlc8';

// Эти данные больше не работают на сайте, но пусть лежат как запасной вариант
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
