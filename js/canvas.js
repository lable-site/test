// ============================================================
//  canvas.js — анимация частиц на фоне hero-секции
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

// ---- Resize canvas ----
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

// ---- Класс частицы ----
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

// ---- Инициализация частиц ----
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

// ---- Один кадр анимации (вызывается из RAF loop в main.js) ----
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
