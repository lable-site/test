// ============================================================
//  artists.js — загрузка артистов и инициализация слайдера
// ============================================================

import { USE_MOCK, mockArtists, SUPABASE_URL, SUPABASE_KEY } from './config.js';

// ---- Сервис данных ----
const ArtistService = {
    async getArtists() {
        if (USE_MOCK) return mockArtists;

        // Я исправил эту строчку, чтобы она не искала несуществующие колонки
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/artists?select=*&order=id`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        if (!res.ok) throw new Error('Supabase: не удалось загрузить артистов');
        return res.json();
    }
};

// ---- Создание слайда (защита от XSS) ----
function createArtistSlide(artist) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    const card = document.createElement('div');
    card.className = 'artist-card';

    const img = document.createElement('img');
    img.src = artist.img || artist.photo_url || '';
    img.alt = artist.name || '';
    img.loading = 'lazy';
    img.decoding = 'async';

    const info = document.createElement('div');
    info.className = 'artist-info';

    const title = document.createElement('h3');
    title.textContent = artist.name || '';

    info.appendChild(title);
    card.appendChild(img);
    card.appendChild(info);
    slide.appendChild(card);

    return slide;
}

// ---- Swiper instance ----
let swiperInstance = null;

function initSwiper(count) {
    // Уничтожаем предыдущий instance если есть
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
    }

    // Нет артистов — ничего не делаем
    if (count === 0) return;

    // Стрелки: отключаем если 1 артист
    const navNext = document.querySelector('.main-next');
    const navPrev = document.querySelector('.main-prev');
    if (count <= 1) {
        if (navNext) navNext.style.display = 'none';
        if (navPrev) navPrev.style.display = 'none';
    } else {
        if (navNext) navNext.style.display = '';
        if (navPrev) navPrev.style.display = '';
    }

    swiperInstance = new Swiper('.artistSwiper', {
        // --- Основное ---
        effect: 'coverflow',
        grabCursor: count > 1,
        centeredSlides: true,       // НЕ меняется в breakpoints никогда
        initialSlide: 0,
        loop: false,
        rewind: count > 1,
        allowTouchMove: count > 1,
        simulateTouch: count > 1,
        slideToClickedSlide: count > 1,
        speed: 800,
        watchSlidesProgress: true,
        touchRatio: 1.5,
        resistanceRatio: 0.85,
        threshold: 5,

        // --- Coverflow ---
        coverflowEffect: {
            rotate: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
            stretch: 50
        },

        // --- Клавиатура ---
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },

        // --- Навигация ---
        navigation: {
            nextEl: '.main-next',
            prevEl: '.main-prev',
        },

        // --- Breakpoints ---
        // ТОЛЬКО slidesPerView и coverflowEffect.stretch — centeredSlides не трогаем
        breakpoints: {
            0: {
                slidesPerView: count === 1 ? 1 : 1.2,
                coverflowEffect: { stretch: 30 }
            },
            768: {
                slidesPerView: count === 1 ? 1 : count === 2 ? 1.5 : 2,
                coverflowEffect: { stretch: 45 }
            },
            1024: {
                slidesPerView: count === 1 ? 1 : count === 2 ? 1.5 : 3,
                coverflowEffect: { stretch: 50 }
            }
        }
    });
}

// ---- Главная функция (вызывается из main.js) ----
export async function renderArtists() {
    const wrapper = document.getElementById('artists-wrapper');
    if (!wrapper) return;

    try {
        wrapper.innerHTML = '';

        const artists = await ArtistService.getArtists();

        // 0 артистов — скрываем секцию
        if (!artists || artists.length === 0) {
            const section = document.getElementById('artists');
            if (section) section.style.display = 'none';
            return;
        }

        // Рендерим слайды
        artists.forEach(artist => {
            wrapper.appendChild(createArtistSlide(artist));
        });

        // Swiper инициализируется ТОЛЬКО после того как DOM готов
        initSwiper(artists.length);

    } catch (error) {
        console.error('Ошибка загрузки артистов:', error);
        const section = document.getElementById('artists');
        if (section) section.style.display = 'none';
    }
}

// ---- Экспорт instance для resize в main.js ----
export function getSwiperInstance() {
    return swiperInstance;
}
