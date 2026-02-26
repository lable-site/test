// ============================================================
//  content.js — загрузка услуг и настроек сайта из Supabase
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

        // Проверяем что сервер ответил нормально
        if (!res.ok) throw new Error(`Supabase вернул ошибку: ${res.status}`);

        const services = await res.json();

        if (!services || services.length === 0) return;

        wrapper.innerHTML = '';

        services.forEach(service => {
            // --- Создаём карточку через createElement (защита от XSS) ---
            const card = document.createElement('div');
            card.className = 'service-card reveal active';

            // Иконка — только класс, не HTML
            const icon = document.createElement('i');
            // Разрешаем только буквы, цифры, дефис и пробел — защита от инъекций в class
            const safeIconClass = (service.icon || 'fa-solid fa-star').replace(/[^a-zA-Z0-9\-\s]/g, '');
            icon.className = safeIconClass + ' service-icon';
            icon.setAttribute('aria-hidden', 'true');

            // Заголовок — textContent, не innerHTML
            const title = document.createElement('h3');
            title.textContent = service.title || '';

            // Список пунктов — каждый через textContent
            const ul = document.createElement('ul');
            if (service.description) {
                service.description
                    .split('\n')
                    .map(text => text.trim())
                    .filter(text => text !== '')
                    .forEach(text => {
                        const li = document.createElement('li');
                        li.textContent = text; // textContent = безопасно
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
        // Не трогаем wrapper — если в HTML есть хардкод-карточки, они останутся
    }
}

// ---- 2. Загрузка ссылок и кнопок ----
export async function renderSiteConfig() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?select=*`, {
            headers: { 'apikey': SUPABASE_KEY }
        });

        // Проверяем что сервер ответил нормально
        if (!res.ok) throw new Error(`Supabase вернул ошибку: ${res.status}`);

        const config = await res.json();

        // Превращаем массив [{key, value}] в удобный объект {key: value}
        const settings = {};
        config.forEach(item => {
            if (item.key) settings[item.key] = item.value;
        });

        // --- Текст на первом экране ---
        // Используем textContent для безопасности, переносы строк через <br> добавляем вручную
        const heroIntro = document.querySelector('.hero-intro');
        if (heroIntro && settings.hero_text) {
            heroIntro.innerHTML = ''; // очищаем
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

        // --- Ссылки на соцсети ---
        // Ищем по aria-label — это надёжнее чем по тексту внутри кнопки
        // aria-label не меняется при редактировании контента
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
        // Сайт продолжит работу с дефолтными значениями из HTML
    }
}
