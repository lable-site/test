// ============================================================
//  main.js — точка входа. Запускает всё остальное.
// ============================================================

import { renderArtists, getSwiperInstance } from './artists.js';
import { resizeCanvas, animateParticles, initStars, animateStars } from './canvas.js';
import { initReveal } from './animations.js';
import { renderServices, renderStats, renderSocials, renderSiteConfig } from './content.js';

// ⚠️  СТРОКУ НИЖЕ НЕ ТРОГАТЬ — принудительно включаем анимации для всех
const prefersReducedMotion = false;
let lenis = null;
let globalRafId = null;
let lastTime = performance.now();

// ---- Lenis (плавный скролл) ----
// ИСПРАВЛЕНИЕ: обёрнуто в try/catch.
// Если CDN с библиотекой Lenis не загрузился (медленный интернет,
// заблокированный CDN, корпоративный файрвол) — переменная Lenis
// будет undefined. Без try/catch строка "new Lenis(...)" упала бы
// с ошибкой и ЗАМОРОЗИЛА весь сайт. С try/catch — просто работает
// без плавного скролла, остальное всё живо.
if (!prefersReducedMotion) {
    try {
        lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
        });
    } catch (e) {
        console.warn('Lenis недоступен (CDN не загрузился). Скролл работает в стандартном режиме.');
        lenis = null;
    }
}

// ---- Единый RAF loop — canvas + звёзды + плавный скролл ----
function renderLoop(time) {
    let dt = time - lastTime;
    lastTime = time;
    if (dt > 100) dt = 16.6; // защита от "прыжка" после свёрнутой вкладки

    if (!prefersReducedMotion) {
        if (lenis) lenis.raf(time);
        animateParticles(dt);
        animateStars(dt);
    }

    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Пауза когда вкладка неактивна (экономим CPU и батарею) ----
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(globalRafId);
    } else if (!prefersReducedMotion) {
        lastTime = performance.now();
        globalRafId = requestAnimationFrame(renderLoop);
    }
});

// ---- Resize с debounce (пересчёт canvas при изменении размера окна) ----
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeCanvas(prefersReducedMotion);
        initStars(prefersReducedMotion);
        const swiper = getSwiperInstance();
        if (swiper) swiper.update();
    }, 250);
});

// ---- Canvas запускаем сразу — не зависит от данных Supabase ----
resizeCanvas(prefersReducedMotion);
initStars(prefersReducedMotion);

if (!prefersReducedMotion) {
    globalRafId = requestAnimationFrame(renderLoop);
}

// ============================================================
//  ИСПРАВЛЕНИЕ "ГОНКИ ДАННЫХ"
//
//  ЧТО БЫЛО:
//  renderSocials() и renderSiteConfig() шли параллельно.
//  renderSiteConfig ищет кнопки .social-btn[aria-label="..."]
//  в HTML-документе, чтобы вставить в них правильные ссылки.
//  Но в момент поиска renderSocials ЕЩЁ НЕ СОЗДАЛА эти кнопки —
//  они рождаются динамически через JavaScript.
//  Результат: renderSiteConfig находила пустоту, ссылки терялись.
//
//  ЧТО СТАЛО:
//  Шаг 1 — параллельно грузим всё что не зависит друг от друга:
//           артисты, соцсети (создаются кнопки), услуги, статистика.
//  Шаг 2 — .then() запускается СТРОГО ПОСЛЕ того как Шаг 1 завершён.
//           В этот момент кнопки соцсетей гарантированно в DOM.
//           renderSiteConfig находит их и вставляет правильные ссылки.
//  Шаг 3 — второй .then(): перемеряем canvas (секция услуг теперь
//           полная, не пустая) и запускаем reveal-анимации появления.
// ============================================================
Promise.allSettled([
    renderArtists(),
    renderSocials(),   // создаёт кнопки соцсетей в DOM
    renderServices(),
    renderStats(),
])
.then(() => {
    // Шаг 2: кнопки соцсетей точно в DOM — вставляем ссылки из конфига
    return renderSiteConfig();
})
.then(() => {
    // Шаг 3: весь контент загружен — перемеряем canvas и запускаем анимации
    resizeCanvas(prefersReducedMotion);
    initStars(prefersReducedMotion);
    initReveal(prefersReducedMotion);
});
