// ============================================================
//  main.js — точка входа. Запускает всё остальное.
// ============================================================

import { renderArtists, getSwiperInstance } from './artists.js';
import { resizeCanvas, initParticles, animateParticles } from './canvas.js';
import { initReveal } from './animations.js';
import { renderServices, renderSiteConfig } from './content.js';

// ---- Глобальные переменные ----
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

// ---- Единый RAF loop (canvas + lenis в одном месте) ----
function renderLoop(time) {
    let dt = time - lastTime;
    lastTime = time;
    if (dt > 100) dt = 16.6;

    if (!prefersReducedMotion) {
        if (lenis) lenis.raf(time);
        animateParticles(dt);
    }

    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Пауза анимации когда вкладка не активна ----
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
        resizeCanvas();
        initParticles(prefersReducedMotion);
        const swiper = getSwiperInstance();
        if (swiper) swiper.update();
    }, 250);
});

// ---- Запуск canvas и скролла сразу — они не зависят от данных ----
resizeCanvas();
initParticles(prefersReducedMotion);

if (!prefersReducedMotion) {
    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Загрузка данных параллельно, initReveal ПОСЛЕ ----
// Promise.allSettled — если одна функция упала, остальные всё равно выполнятся
// Это важно: без этого один сбой базы мог обрушить всю страницу
Promise.allSettled([
    renderArtists(),
    renderServices(),
    renderSiteConfig(),
]).then(() => {
    // Только теперь запускаем анимации появления —
    // когда все карточки уже вставлены в DOM
    initReveal(prefersReducedMotion);
});
