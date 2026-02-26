// ============================================================
//  artists.js — загрузка артистов и инициализация слайдера
// ============================================================

import { USE_MOCK, mockArtists, SUPABASE_URL, SUPABASE_KEY } from './config.js';

// ---- Сервис данных ----
const ArtistService = {
    async getArtists() {
        if (USE_MOCK) return mockArtists;

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
    if (swiperInstance) {
        swiperInstance.destroy(true, true);
        swiperInstance = null;
    }

    if (count === 0) return;

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
        effect: 'coverflow',
        grabCursor: count > 1,
        centeredSlides: true,
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

        coverflowEffect: {
            rotate: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
            stretch: 30
        },

        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },

        navigation: {
            nextEl: '.main-next',
            prevEl: '.main-prev',
        },

        // --- ВОТ ТУТ ГЛАВНАЯ МАГИЯ ---
        breakpoints: {
            0: {
                slidesPerView: count === 1 ? 1 : 1.2,
                coverflowEffect: { stretch: 30, depth: 200 } // Мобилка: глубокое 3D
            },
            768: {
                slidesPerView: count === 1 ? 1 : count === 2 ? 1.5 : 2,
                coverflowEffect: { stretch: 20, depth: 80 } // Планшет: чуть поровнее
            },
            1024: {
                slidesPerView: count === 1 ? 1 : count === 2 ? 1.5 : 3,
                coverflowEffect: { stretch: 0, depth: 0 } // Комп: отключаем 3D искажение!
                centeredSlides: false
            }
        }
    });
}

export async function renderArtists() {
    const wrapper = document.getElementById('artists-wrapper');
    if (!wrapper) return;

    try {
        wrapper.innerHTML = '';
        const artists = await ArtistService.getArtists();

        if (!artists || artists.length === 0) {
            const section = document.getElementById('artists');
            if (section) section.style.display = 'none';
            return;
        }

        artists.forEach(artist => {
            wrapper.appendChild(createArtistSlide(artist));
        });

        initSwiper(artists.length);

    } catch (error) {
        console.error('Ошибка загрузки артистов:', error);
        const section = document.getElementById('artists');
        if (section) section.style.display = 'none';
    }
}

export function getSwiperInstance() {
    return swiperInstance;
}
