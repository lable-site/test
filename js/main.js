// ============================================================
//  main.js — точка входа. Запускает всё остальное.
// ============================================================

import { renderArtists, getSwiperInstance } from './artists.js';
import { resizeCanvas, initParticles, animateParticles, initStars, animateStars } from './canvas.js';
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

// ---- Единый RAF loop — hero canvas + звёзды + lenis ----
function renderLoop(time) {
    let dt = time - lastTime;
    lastTime = time;
    if (dt > 100) dt = 16.6;

    if (!prefersReducedMotion) {
        if (lenis) lenis.raf(time);
        animateParticles(dt);
        animateStars(dt);    // звёзды за слайдером
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
        initStars(prefersReducedMotion);    // пересчитываем звёзды при resize
        const swiper = getSwiperInstance();
        if (swiper) swiper.update();
    }, 250);
});

// ---- Запуск canvas — не зависит от данных ----
resizeCanvas();
initParticles(prefersReducedMotion);
initStars(prefersReducedMotion);

if (!prefersReducedMotion) {
    globalRafId = requestAnimationFrame(renderLoop);
}

// ---- Данные параллельно, initReveal строго после ----
Promise.allSettled([
    renderArtists(),
    renderServices(),
    renderStats(),
    renderSiteConfig(),
]).then(() => {
    initReveal(prefersReducedMotion);
});
