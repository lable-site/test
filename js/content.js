// ============================================================
//  content.js — загрузка услуг, статистики и настроек из Supabase
// ============================================================

import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

// ---- 1. Загрузка спектра услуг ----
export async function renderServices() {
    const wrapper = document.querySelector('.services-grid');
    if (!wrapper) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/services?select=*&order=id`, {
            headers: { 'apikey': SUPABASE_KEY }
        });

        if (!res.ok) throw new Error(`Supabase вернул ошибку: ${res.status}`);

        const services = await res.json();

        if (!services || services.length === 0) return;

        wrapper.innerHTML = '';

        services.forEach(service => {
            const card = document.createElement('div');
            card.className = 'service-card reveal active';

            const icon = document.createElement('i');
            const safeIconClass = (service.icon || 'fa-solid fa-star').replace(/[^a-zA-Z0-9\-\s]/g, '');
            icon.className = safeIconClass + ' service-icon';
            icon.setAttribute('aria-hidden', 'true');

            const title = document.createElement('h3');
            title.textContent = service.title || '';

            const ul = document.createElement('ul');
            if (service.description) {
                service.description
                    .split('\n')
                    .map(text => text.trim())
                    .filter(text => text !== '')
                    .forEach(text => {
                        const li = document.createElement('li');
                        li.textContent = text;
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

// ---- 2. Загрузка статистики ----
// Данные берутся из таблицы stats в Supabase.
// Если таблица недоступна — в HTML остаются хардкод-цифры как запасной вариант.
export async function renderStats() {
    const grid = document.getElementById('stats-grid');
    if (!grid) return;

    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/stats?select=*&order=order_id`, {
            headers: { 'apikey': SUPABASE_KEY }
        });

        if (!res.ok) throw new Error(`Supabase вернул ошибку: ${res.status}`);

        const stats = await res.json();

        // Если данных нет — оставляем хардкод из HTML, не трогаем
        if (!stats || stats.length === 0) return;

        // Очищаем хардкод и рендерим из базы
        grid.innerHTML = '';

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'stat-card reveal';

            // data-target и data-suffix нужны animations.js для анимации счётчика
            const number = document.createElement('div');
            number.className = 'stat-number';
            number.dataset.target = stat.value || 0;
            number.dataset.suffix = stat.suffix || '';
            number.textContent = '0'; // начальное значение для анимации

            const label = document.createElement('div');
            label.className = 'stat-label';
            label.textContent = stat.label || '';

            card.appendChild(number);
            card.appendChild(label);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
        // Ничего не делаем — хардкод из HTML остаётся как запасной вариант
    }
}

// ---- 3. Загрузка ссылок и кнопок ----
export async function renderSiteConfig() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?select=*`, {
            headers: { 'apikey': SUPABASE_KEY }
        });

        if (!res.ok) throw new Error(`Supabase вернул ошибку: ${res.status}`);

        const config = await res.json();

        const settings = {};
        config.forEach(item => {
            if (item.key) settings[item.key] = item.value;
        });

        // --- Текст на первом экране ---
        const heroIntro = document.querySelector('.hero-intro');
        if (heroIntro && settings.hero_text) {
            heroIntro.innerHTML = '';
            settings.hero_text.split('\n').forEach((line, index, arr) => {
                heroIntro.appendChild(document.createTextNode(line));
                if (index < arr.length - 1) {
                    heroIntro.appendChild(document.createElement('br'));
                }
            });
        }

        // --- Заголовок перед соцсетями ---
        const joinTitle = document.querySelector('.socials-section .section-title');
        if (joinTitle && settings.join_text) {
            joinTitle.textContent = settings.join_text;
        }

        // --- Главная кнопка "Отправить демо" ---
        const demoBtn = document.querySelector('.btn-primary');
        if (demoBtn) {
            if (settings.demo_link) demoBtn.href = settings.demo_link;
            if (settings.demo_text) demoBtn.textContent = settings.demo_text;
        }

        // --- Ссылки на соцсети — ищем по aria-label, это надёжно ---
        if (settings.vk_link) {
            const vk = document.querySelector('.social-btn[aria-label="ВКонтакте"]');
            if (vk) vk.href = settings.vk_link;
        }
        if (settings.tg_link) {
            const tg = document.querySelector('.social-btn[aria-label="Telegram"]');
            if (tg) tg.href = settings.tg_link;
        }
        if (settings.yt_link) {
            const yt = document.querySelector('.social-btn[aria-label="YouTube"]');
            if (yt) yt.href = settings.yt_link;
        }

    } catch (error) {
        console.error('Ошибка загрузки настроек сайта:', error);
    }
}
