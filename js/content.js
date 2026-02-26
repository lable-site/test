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
        const services = await res.json();

        // Если в базе есть услуги, заменяем те, что в HTML
        if (services && services.length > 0) {
            wrapper.innerHTML = ''; // Очищаем старые карточки

            services.forEach(service => {
                // Магия: разбиваем текст описания по строкам (Enter) и делаем из них пункты списка
                const listHtml = service.description
                    ? service.description.split('\n').filter(text => text.trim() !== '').map(text => `<li>${text.trim()}</li>`).join('')
                    : '';

                const card = document.createElement('div');
                card.className = 'service-card reveal active'; // Сразу активные, чтобы появилась анимация
                
                card.innerHTML = `
                    <i class="${service.icon || 'fa-solid fa-star'} service-icon"></i>
                    <h3>${service.title}</h3>
                    <ul>${listHtml}</ul>
                `;
                wrapper.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки услуг:', error);
    }
}

// ---- 2. Загрузка ссылок и кнопок ----
export async function renderSiteConfig() {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_config?select=*`, {
            headers: { 'apikey': SUPABASE_KEY }
        });
        const config = await res.json();
        
        // Превращаем массив базы данных в удобный словарь
        const settings = {};
        config.forEach(item => settings[item.key] = item.value);

        // --- Меняем главную кнопку "Отправить Демо" ---
        const demoBtn = document.querySelector('.btn-primary');
        if (demoBtn) {
            if (settings.demo_link) demoBtn.href = settings.demo_link;
            if (settings.demo_text) demoBtn.textContent = settings.demo_text;
        }

        // --- Меняем ссылки на соцсети в подвале ---
        const socialLinks = document.querySelectorAll('.social-links .social-btn');
        socialLinks.forEach(link => {
            if (link.textContent.includes('ВКонтакте') && settings.vk_link) link.href = settings.vk_link;
            if (link.textContent.includes('Telegram') && settings.tg_link) link.href = settings.tg_link;
            if (link.textContent.includes('YouTube') && settings.yt_link) link.href = settings.yt_link;
        });

    } catch (error) {
        console.error('Ошибка загрузки настроек сайта:', error);
    }
}
