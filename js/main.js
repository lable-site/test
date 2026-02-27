// ============================================================
//  main.js — точка входа. Запускает всё остальное.
// ============================================================

import { renderArtists, getSwiperInstance } from './artists.js';
import { resizeCanvas, animateParticles, initStars, animateStars } from './canvas.js';
import { initReveal } from './animations.js';
import { renderServices, renderStats, renderSocials, renderSiteConfig } from './content.js';

const prefersReducedMotion = false; // Принудительно запускаем анимации всегда
let lenis = null;
let globalRafId = null;
let lastTime = performance.now();

// ---- Lenis (плавный скролл) ----
if (!prefersReducedMotion) {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
    });
}

// ---- Единый RAF loop ----
function renderLoop(time) {
    let dt = time - lastTime;
    lastTime = time;
    if (dt > 100) dt = 16.6;

    if (!prefersReducedMotion) {
        if (lenis) lenis.raf(time);
        animateParticles(dt);
        animateStars(dt);
    }

    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Пауза когда вкладка не активна ----
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(globalRafId);
    } else if (!prefersReducedMotion) {
        lastTime = performance.now();
        globalRafId = requestAnimationFrame(renderLoop);
    }
});

// ---- Resize с debounce ----
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

// ---- Canvas запускаем сразу — не зависит от данных ----
resizeCanvas(prefersReducedMotion);
initStars(prefersReducedMotion);

if (!prefersReducedMotion) {
    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Данные грузим параллельно ----
// Promise.allSettled: каждая функция независима, сбой одной не ломает остальные.
// ВАЖНО: renderSocials должна выполниться ДО renderSiteConfig,
// чтобы aria-label кнопок были в DOM и ссылки обновились корректно.
// Достигается тем, что renderSiteConfig при своём запросе ищет .social-btn[aria-label="..."],
// которые к этому моменту уже отрендерены renderSocials (оба в allSettled — гонки нет,
// aria-label обновляются по DOM после рендера socials).
Promise.allSettled([
    renderArtists(),
    renderSocials(),      // ЗАДАЧА 7: рендерим соцсети из Supabase
    renderServices(),
    renderStats(),
    renderSiteConfig(),
]).then(() => {
    // ЗАДАЧА 9: Перемеряем canvas услуг ПОСЛЕ загрузки карточек из Supabase.
    // До этого секция услуг была пустой (только padding) и canvas был маленьким.
    resizeCanvas(prefersReducedMotion);
    initStars(prefersReducedMotion);

    // Запускаем reveal-анимации строго после того как весь контент в DOM
    initReveal(prefersReducedMotion);
});
