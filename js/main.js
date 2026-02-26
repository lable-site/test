// ============================================================
//  main.js — точка входа. Запускает всё остальное.
// ============================================================

import { renderArtists, getSwiperInstance } from './artists.js';
import { resizeCanvas, initParticles, animateParticles } from './canvas.js';
import { initReveal } from './animations.js';
import { renderServices, renderStats, renderSiteConfig } from './content.js';

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

// ---- Единый RAF loop ----
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
        resizeCanvas();
        initParticles(prefersReducedMotion);
        const swiper = getSwiperInstance();
        if (swiper) swiper.update();
    }, 250);
});

// ---- Canvas запускаем сразу — не зависит от данных ----
resizeCanvas();
initParticles(prefersReducedMotion);

if (!prefersReducedMotion) {
    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Данные грузим параллельно, initReveal — строго после ----
// Promise.allSettled: даже если одна функция упала, остальные выполнятся
// initReveal в .then() — анимации запускаются когда все карточки уже в DOM
Promise.allSettled([
    renderArtists(),
    renderServices(),
    renderStats(),
    renderSiteConfig(),
]).then(() => {
    initReveal(prefersReducedMotion);
});
