// ============================================================
//  canvas.js — анимация частиц (hero, services) + звёзды
// ============================================================

const mouse = { x: 0, y: 0, radius: 150 };

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

// ============================================================
//  PARTICLES SYSTEM (Hero & Services)
// ============================================================

class ParticleSystem {
    constructor(canvasId, type) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.section = this.canvas.parentElement;
        // Для Услуг делаем прозрачный фон, чтобы было видно CSS-подложку
        this.ctx = this.canvas.getContext('2d', { alpha: type === 'services' });
        this.type = type;
        this.particles = [];
        this.w = 0;
        this.h = 0;
        this.bgColor = type === 'hero' ? '#05020a' : null; 
    }

    resize(prefersReducedMotion) {
        if (!this.canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = this.section.offsetWidth;
        this.h = this.section.offsetHeight;

        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (this.bgColor) {
            this.ctx.fillStyle = this.bgColor;
            this.ctx.fillRect(0, 0, this.w, this.h);
        } else {
            this.ctx.clearRect(0, 0, this.w, this.h);
        }

        this.particles = [];
        if (prefersReducedMotion) return;

        let amount = Math.max(80, Math.min(Math.floor(this.w * this.h / 10000), 300));
        // В услугах делаем чуть меньше частиц, чтобы не перегружать текст
        if (this.type === 'services') amount = Math.floor(amount * 0.7); 

        for (let i = 0; i < amount; i++) {
            const x = Math.random() * this.w;
            let y;
            if (this.type === 'hero') {
                // На главной - частицы формируют волну по центру
                const wave1 = this.h / 2 + Math.sin(x * 0.005) * 150;
                const wave2 = this.h / 2 + Math.cos(x * 0.005) * 150;
                y = (Math.random() > 0.5 ? wave1 : wave2) + (Math.random() * 100 - 50);
            } else {
                // В услугах - частицы разбросаны хаотично по всей секции
                y = Math.random() * this.h;
            }
            this.particles.push(new Particle(x, y, this.ctx, this.type));
        }

        if (prefersReducedMotion) {
            this.particles.forEach(p => p.draw());
        }
    }

    animate(dt) {
        if (!this.canvas || this.particles.length === 0) return;
        const timeScale = dt / 16.66;

        if (this.bgColor) {
            this.ctx.fillStyle = this.bgColor;
            this.ctx.fillRect(0, 0, this.w, this.h);
        } else {
            this.ctx.clearRect(0, 0, this.w, this.h);
        }

        // Вычисляем позицию мыши относительно конкретного канваса (учитываем скролл)
        const rect = this.canvas.getBoundingClientRect();
        const localMouseX = mouse.x - rect.left;
        const localMouseY = mouse.y - rect.top;

        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update(timeScale, localMouseX, localMouseY);
            this.particles[i].draw();
        }
    }
}

class Particle {
    constructor(x, y, ctx, type) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.type = type;
        this.size = Math.random() * 2.5 + 0.5;
        this.density = (Math.random() * 30) + 1;
        this.angle = Math.random() * 360;
        this.color = `rgba(${100 + Math.random()*50}, ${30 + Math.random()*40}, ${200 + Math.random()*55}, ${Math.random() * 0.8 + 0.2})`;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    update(timeScale, mx, my) {
        this.angle += 0.02 * timeScale;

        const dx = mx - this.x;
        const dy = my - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius && distance > 0) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= (dx / distance) * force * this.density * timeScale;
            this.y -= (dy / distance) * force * this.density * timeScale;
        } else {
            const targetX = this.baseX;
            // В услугах частицы плавают с бОльшей амплитудой
            const amplitude = this.type === 'hero' ? 15 : 40; 
            const targetY = this.baseY + Math.sin(this.angle) * amplitude;
            
            this.x -= ((this.x - targetX) / 15) * timeScale;
            this.y -= ((this.y - targetY) / 15) * timeScale;
        }
    }
}

// ============================================================
//  STARS SYSTEM (Artists, Stats, Socials)
// ============================================================

class StarSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true });
        this.stars = [];
        this.w = 0;
        this.h = 0;
    }

    resize(prefersReducedMotion) {
        const section = this.canvas.parentElement;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.w = section.offsetWidth;
        this.h = section.offsetHeight;

        this.canvas.width = this.w * dpr;
        this.canvas.height = this.h * dpr;
        this.canvas.style.width = this.w + 'px';
        this.canvas.style.height = this.h + 'px';

        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        this.stars = [];
        if (prefersReducedMotion) return;

        // Плотность звёзд
        const amount = Math.min(50, Math.floor(this.w * this.h / 20000));

        for (let i = 0; i < amount; i++) {
            this.stars.push(new Star(this.w, this.h));
        }
    }

    animate(dt) {
        if (this.stars.length === 0) return;
        const timeScale = dt / 16.66;

        this.ctx.clearRect(0, 0, this.w, this.h);

        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].update(timeScale);
            this.stars[i].draw(this.ctx);
        }
    }
}

class Star {
    constructor(w, h) {
        this.reset(w, h, true);
    }

    reset(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : -5;
        this.size = Math.random() * 1.5 + 0.5; // Чуть крупнее
        this.speedY = Math.random() * 0.3 + 0.1; // Быстрее падают
        this.speedX = (Math.random() - 0.5) * 0.15; // Сильнее дрейфуют вбок
        this.alpha = Math.random() * 0.4 + 0.2;
        this.twinkleSpeed = Math.random() * 0.01 + 0.005; // Плавнее мерцают
        this.twinkleAngle = Math.random() * Math.PI * 2;
        this.w = w;
        this.h = h;
    }

    update(timeScale) {
        this.y += this.speedY * timeScale;
        this.x += this.speedX * timeScale;
        this.twinkleAngle += this.twinkleSpeed * timeScale;

        if (this.y > this.h + 5 || this.x < -5 || this.x > this.w + 5) {
            this.reset(this.w, this.h, false);
        }
    }

    draw(ctx) {
        const flicker = this.alpha + Math.sin(this.twinkleAngle) * 0.15;
        const a = Math.max(0, Math.min(1, flicker));

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 215, 255, ${a})`;
        ctx.fill();
    }
}

// ============================================================
//  EXPORTS FOR main.js
// ============================================================

let heroSystem = null;
let servicesSystem = null;
let starSystems = [];

export function resizeCanvas(prefersReducedMotion) {
    if (!heroSystem) heroSystem = new ParticleSystem('hero-canvas', 'hero');
    heroSystem.resize(prefersReducedMotion);

    if (!servicesSystem) servicesSystem = new ParticleSystem('services-canvas', 'services');
    servicesSystem.resize(prefersReducedMotion);
}

export function animateParticles(dt) {
    if (heroSystem) heroSystem.animate(dt);
    if (servicesSystem) servicesSystem.animate(dt);
}

export function initStars(prefersReducedMotion) {
    // Собираем все канвасы со звёздами по классу
    if (starSystems.length === 0) {
        const canvases = document.querySelectorAll('.stars-canvas-bg');
        canvases.forEach(canvas => {
            starSystems.push(new StarSystem(canvas));
        });
    }
    starSystems.forEach(sys => sys.resize(prefersReducedMotion));
}

export function animateStars(dt) {
    starSystems.forEach(sys => sys.animate(dt));
}
