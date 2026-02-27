// ============================================================
//  content.js — загрузка данных из Supabase
// ============================================================

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// ============================================================
//  КЭШ-ПРОСЛОЙКА — sessionStorage
//
//  ЧТО ТАКОЕ sessionStorage ПРОСТЫМИ СЛОВАМИ:
//  Это временная записная книжка браузера для одной вкладки.
//  Пока вкладка открыта — всё помнит. Закрыл вкладку —
//  записная книжка сгорела, всё чисто. Следующий визит
//  снова сходит в базу и снова запишет свежие данные.
//
//  ЗАЧЕМ НАМ ЭТО:
//  Каждый раз когда посетитель заходит на сайт, браузер делает
//  5 запросов в Supabase (артисты, услуги, статистика,
//  соцсети, конфиг). Если зайдут 1000 человек — 5000 запросов.
//  У бесплатного плана Supabase лимит ~500k запросов в месяц.
//
//  С КЭШ:
//  Первый визит = 5 запросов (данные сохраняются в кэш).
//  Обновил страницу в той же вкладке = 0 запросов, берёт из памяти.
//  Новая вкладка/новый визит = снова 5 запросов (кэш сгорел).
//  В худшем случае экономим 80-90% запросов.
// ============================================================

async function supabaseFetch(path) {
    const cacheKey = 'native_v1_' + path; // префикс native_v1_ — наш "namespace"

    // ШАГ 1: Проверяем кэш
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            // Данные есть — возвращаем из памяти, в базу не идём
            return JSON.parse(cached);
        }
    } catch (e) {
        // sessionStorage может быть недоступен в режиме инкогнито
        // с жёсткими настройками или на старых браузерах.
        // Просто идём дальше — сайт не ломается.
    }

    // ШАГ 2: Кэша нет — делаем запрос в Supabase
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        headers: { 'apikey': SUPABASE_KEY }
    });
    if (!res.ok) throw new Error(`Supabase ошибка ${res.status} на /${path}`);
    const data = await res.json();

    // ШАГ 3: Сохраняем ответ в кэш для следующего раза
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (e) {
        // Кэш переполнен или недоступен — не страшно, данные уже есть в переменной
    }

    return data;
}

// ============================================================
//  1. Услуги
// ============================================================
export async function renderServices() {
    const wrapper = document.querySelector('.services-grid');
    if (!wrapper) return;

    try {
        const services = await supabaseFetch('services?select=*&order=id');

        if (!services || services.length === 0) {
            const section = document.getElementById('services');
            if (section) section.style.display = 'none';
            return;
        }

        wrapper.innerHTML = '';

        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card reveal';

            const icon = document.createElement('i');
            // Санитизация: убираем всё кроме букв, цифр, дефиса и пробела
            const safeIconClass = (service.icon || 'fa-solid fa-star').replace(/[^a-zA-Z0-9\-\s]/g, '');
            icon.className = safeIconClass + ' service-icon';
            icon.setAttribute('aria-hidden', 'true');

            const title = document.createElement('h3');
            title.textContent = service.title || '';

            const ul = document.createElement('ul');
            if (service.description) {
                service.description
                    .split('\n')
                    .map(t => t.trim())
                    .filter(t => t !== '')
                    .forEach(t => {
                        const li = document.createElement('li');
                        li.textContent = t;
                        ul.appendChild(li);
                    });
            }

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(ul);
            wrapper.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
    }
}

// ============================================================
//  2. Статистика
// ============================================================
export async function renderStats() {
    const grid = document.querySelector('.stats-grid');
    if (!grid) return;

    try {
        const stats = await supabaseFetch('stats?select=*&order=order_id');

        if (!stats || stats.length === 0) return;

        grid.innerHTML = '';

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card reveal';

            const number = document.createElement('div');
            number.className = 'stat-number';
            number.dataset.target = stat.value || 0;
            number.dataset.suffix = stat.suffix || '';
            number.textContent = '0';

            const label = document.createElement('div');
            label.className = 'stat-label';
            label.textContent = stat.label || '';

            card.appendChild(number);
            card.appendChild(label);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}

// ============================================================
//  3. Соцсети
//  Берёт данные из таблицы social_links (name, url, icon_class, order_id)
//  Fallback: если таблица недоступна — показывает дефолтные кнопки
// ============================================================
const fallbackSocials = [
    { name: 'ВКонтакте', url: 'https://vk.ru/nativelabel',        icon_class: 'fa-brands fa-vk' },
    { name: 'Telegram',  url: 'https://t.me/native_label',        icon_class: 'fa-brands fa-telegram' },
    { name: 'YouTube',   url: 'https://youtube.com/@nativelabel', icon_class: 'fa-brands fa-youtube' },
];

export async function renderSocials() {
    const container = document.getElementById('social-links-container');
    if (!container) return;

    let socials = fallbackSocials;

    try {
        const data = await supabaseFetch('social_links?select=*&order=order_id');
        if (data && data.length > 0) socials = data;
    } catch (error) {
        // Таблица ещё не создана или ошибка сети — fallback, сайт не ломается
        console.warn('social_links недоступен, используем fallback:', error.message);
    }

    container.innerHTML = '';

    socials.forEach(social => {
        const a = document.createElement('a');
        // aria-label читается renderSiteConfig для вставки ссылок — не удалять
        a.setAttribute('aria-label', social.name || '');
        a.href = social.url || '#';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'social-btn';

        const icon = document.createElement('i');
        const safeClass = (social.icon_class || 'fa-solid fa-link').replace(/[^a-zA-Z0-9\-\s]/g, '');
        icon.className = safeClass;
        icon.setAttribute('aria-hidden', 'true');

        const text = document.createTextNode(' ' + (social.name || ''));

        a.appendChild(icon);
        a.appendChild(text);
        container.appendChild(a);
    });
}

// ============================================================
//  4. Настройки сайта — site_config
//
//  ВАЖНО: эта функция вызывается В .then() после renderSocials.
//  Это гарантирует что кнопки соцсетей уже в DOM когда мы
//  ищем их через .querySelector (исправление гонки данных).
// ============================================================
export async function renderSiteConfig() {
    try {
        const config = await supabaseFetch('site_config?select=*');

        const s = {};
        config.forEach(item => { if (item.key) s[item.key] = item.value; });

        // --- Hero: вступительный текст ---
        const heroIntro = document.querySelector('.hero-intro');
        if (heroIntro && s.hero_text) {
            heroIntro.innerHTML = '';
            s.hero_text.split('\n').forEach((line, i, arr) => {
                heroIntro.appendChild(document.createTextNode(line));
                if (i < arr.length - 1) heroIntro.appendChild(document.createElement('br'));
            });
        }

        // --- Заголовок секции соцсетей ---
        const joinTitle = document.querySelector('.socials-title');
        if (joinTitle && s.join_text) joinTitle.textContent = s.join_text;

        // --- Кнопка "Отправить демо" ---
        const demoBtn = document.querySelector('.btn-primary');
        if (demoBtn) {
            if (s.demo_link) demoBtn.href = s.demo_link;
            if (s.demo_text) demoBtn.textContent = s.demo_text;
        }

        // --- Ссылки соцсетей ---
        // На этот момент кнопки уже в DOM (renderSocials отработала раньше)
        if (s.vk_link) {
            const vk = document.querySelector('.social-btn[aria-label="ВКонтакте"]');
            if (vk) vk.href = s.vk_link;
        }
        if (s.tg_link) {
            const tg = document.querySelector('.social-btn[aria-label="Telegram"]');
            if (tg) tg.href = s.tg_link;
        }
        if (s.yt_link) {
            const yt = document.querySelector('.social-btn[aria-label="YouTube"]');
            if (yt) yt.href = s.yt_link;
        }

        // --- Заголовки секций (редактируются из Supabase) ---
        const titleArtists = document.getElementById('title-artists');
        if (titleArtists && s.artists_title) titleArtists.textContent = s.artists_title;

        const titleServices = document.getElementById('title-services');
        if (titleServices && s.services_title) titleServices.textContent = s.services_title;

        // --- Футер ---
        const footerCopyright = document.getElementById('footer-copyright');
        if (footerCopyright && s.footer_copyright) footerCopyright.textContent = s.footer_copyright;

        const footerTagline = document.getElementById('footer-tagline');
        if (footerTagline && s.footer_tagline) footerTagline.textContent = s.footer_tagline;

    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        // Сайт продолжит работу с дефолтными значениями из HTML
    }
}
