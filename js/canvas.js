// ============================================================
//  canvas.js — анимация частиц (hero) + звёзды (artists)
// ============================================================

// ============================================================
//  HERO CANVAS — фиолетовые частицы на первом экране
// ============================================================

const canvas = document.getElementById('hero-canvas');
const heroSection = document.getElementById('about');
const ctx = canvas.getContext('2d', { alpha: false });

const bgColor = '#05020a';
let width, height;
let particles = [];

const mouse = { x: 0, y: 0, radius: 150 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

export function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = heroSection.offsetWidth;
    height = heroSection.offsetHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    mouse.x = width / 2;
    mouse.y = height / 2;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.size = Math.random() * 2.5 + 0.5;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * 360;
        this.color = `rgba(${100 + Math.random()*50}, ${30 + Math.random()*40}, ${200 + Math.random()*55}, ${Math.random() * 0.8 + 0.2})`;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    update(timeScale) {
        this.angle += 0.02 * timeScale;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * this.density * timeScale;
            this.y -= (dy / distance) * force * this.density * timeScale;
        } else {
            const targetX = this.baseX;
            const targetY = this.baseY + Math.sin(this.angle) * 15;
            this.x -= ((this.x - targetX) / 15) * timeScale;
            this.y -= ((this.y - targetY) / 15) * timeScale;
        }
    }
}

export function initParticles(prefersReducedMotion) {
    particles = [];

    let amount = Math.max(80, Math.min(Math.floor(width * height / 10000), 300));
    if (prefersReducedMotion) amount = 0;

    for (let i = 0; i < amount; i++) {
        const x = Math.random() * width;
        const wave1 = height / 2 + Math.sin(x * 0.005) * 150;
        const wave2 = height / 2 + Math.cos(x * 0.005) * 150;
        const y = (Math.random() > 0.5 ? wave1 : wave2) + (Math.random() * 100 - 50);
        particles.push(new Particle(x, y));
    }

    if (prefersReducedMotion) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);
        particles.forEach(p => p.draw());
    }
}

export function animateParticles(dt) {
    if (!dt || particles.length === 0) return;
    const timeScale = dt / 16.66;

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        particles[i].update(timeScale);
        particles[i].draw();
    }
}

// ============================================================
//  ARTISTS CANVAS — редкие медленные звёзды за слайдером
// ============================================================

const starsCanvas = document.getElementById('artists-canvas');
let starsCtx = null;
let starsW = 0, starsH = 0;
let stars = [];
let starsReady = false;

// Инициализируем только если canvas существует в DOM
if (starsCanvas) {
    starsCtx = starsCanvas.getContext('2d', { alpha: true });
    starsReady = true;
}

class Star {
    constructor(w, h) {
        this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
        // Случайная позиция по всей секции
        this.x = Math.random() * w;
        // При инициализации — случайная Y, при respawn — появляется сверху
        this.y = initial ? Math.random() * h : -5;
        // Звёзды маленькие — от 0.5 до 1.5px
        this.size = Math.random() * 1.0 + 0.4;
        // Очень медленное падение вниз
        this.speedY = Math.random() * 0.15 + 0.05;
        // Лёгкое горизонтальное дрейфование
        this.speedX = (Math.random() - 0.5) * 0.08;
        // Прозрачность — звёзды ненавязчивые
        this.alpha = Math.random() * 0.4 + 0.15;
        // Мерцание
        this.twinkleSpeed = Math.random() * 0.008 + 0.003;
        this.twinkleAngle = Math.random() * Math.PI * 2;
        this.w = w;
        this.h = h;
    }

    update(timeScale) {
        this.y += this.speedY * timeScale;
        this.x += this.speedX * timeScale;
        this.twinkleAngle += this.twinkleSpeed * timeScale;

        // Если ушла за низ или за края — respawn сверху
        if (this.y > this.h + 5 || this.x < -5 || this.x > this.w + 5) {
            this.reset(this.w, this.h, false);
        }
    }

    draw(ctx) {
        // Мерцание — альфа слегка пульсирует
        const flicker = this.alpha + Math.sin(this.twinkleAngle) * 0.08;
        const a = Math.max(0, Math.min(1, flicker));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // Чисто белые звёзды с очень лёгким холодным оттенком
        ctx.fillStyle = `rgba(220, 215, 255, ${a})`;
        ctx.fill();
    }
}

export function initStars(prefersReducedMotion) {
    if (!starsReady || !starsCtx) return;

    const section = document.getElementById('artists');
    if (!section) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    starsW = section.offsetWidth;
    starsH = section.offsetHeight;

    starsCanvas.width = starsW * dpr;
    starsCanvas.height = starsH * dpr;
    starsCanvas.style.width = starsW + 'px';
    starsCanvas.style.height = starsH + 'px';

    starsCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = [];
    if (prefersReducedMotion) return;

    // Немного звёзд — не много, не редко. ~35 для больших экранов, меньше для мобилок.
    const amount = Math.min(35, Math.floor(starsW * starsH / 25000));

    for (let i = 0; i < amount; i++) {
        stars.push(new Star(starsW, starsH));
    }
}

export function animateStars(dt) {
    if (!starsReady || !starsCtx || stars.length === 0) return;
    const timeScale = dt / 16.66;

    // Прозрачный фон — звёзды поверх CSS-фона секции
    starsCtx.clearRect(0, 0, starsW, starsH);

    for (let i = 0; i < stars.length; i++) {
        stars[i].update(timeScale);
        stars[i].draw(starsCtx);
    }
}
