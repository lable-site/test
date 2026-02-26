// ============================================================
//  artists.js — загрузка и отображение артистов
// ============================================================

import { USE_MOCK, mockArtists, SUPABASE_URL, SUPABASE_KEY } from './config.js';

// ---- Сервис: откуда берём данные ----
const ArtistService = {
    async getArtists() {
        if (USE_MOCK) {
            return mockArtists;
        }

        // --- Supabase (включается когда USE_MOCK = false) ---
        const res = await fetch(
            `${SUPABASE_URL}/rest/v1/artists?order=sort_order&is_visible=eq.true`,
            { headers: { 'apikey': SUPABASE_KEY } }
        );
        if (!res.ok) throw new Error('Supabase: не удалось загрузить артистов');
        return res.json();
    }
};

// ---- Создание карточки артиста (защита от XSS через textContent) ----
function createArtistSlide(artist) {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';

    const card = document.createElement('div');
    card.className = 'artist-card';

    const img = document.createElement('img');
    img.src = artist.img || artist.photo_url; // поддержка обоих форматов (mock и Supabase)
    img.alt = artist.name;
    img.loading = 'lazy';
    img.decoding = 'async';

    const info = document.createElement('div');
    info.className = 'artist-info';

    const title = document.createElement('h3');
    title.textContent = artist.name;

    info.appendChild(title);
    card.appendChild(img);
    card.appendChild(info);
    slide.appendChild(card);

    return slide;
}

// ---- Инициализация Swiper ----
let swiperInstance = null;

function initSwiper(count) {
    if (swiperInstance) {
        swiperInstance.destroy(true, false);
        swiperInstance = null;
    }

    swiperInstance = new Swiper(".artistSwiper", {
        effect: "coverflow",
        grabCursor: true,
        centeredSlides: true,
        initialSlide: 0,
        loop: false,
        rewind: true,
        allowTouchMove: count > 1,
        simulateTouch: count > 1,
        slideToClickedSlide: true,
        speed: 800,
        watchSlidesProgress: true,
        touchRatio: 1.5,
        resistanceRatio: 0.85,
        threshold: 5,
        keyboard: {
            enabled: true,
            onlyInViewport: true,
        },
        coverflowEffect: {
            rotate: 0,
            depth: 200,
            modifier: 1,
            slideShadows: false,
            stretch: 50
        },
        navigation: {
            nextEl: ".main-next",
            prevEl: ".main-prev",
        },
        breakpoints: {
            0: {
                slidesPerView: count === 1 ? 1 : 1.2,
                coverflowEffect: { stretch: 30 }
            },
            768: {
                slidesPerView: count === 2 ? 1.2 : 2,
                coverflowEffect: { stretch: 45 }
            },
            1024: {
                slidesPerView: count === 2 ? 1.2 : 3,
                coverflowEffect: { stretch: 50 }
            }
        }
    });
}

// ---- Главная функция: рендер артистов ----
export async function renderArtists() {
    const wrapper = document.getElementById('artists-wrapper');
    if (!wrapper) return;

    try {
        wrapper.innerHTML = ''; // очищаем

        const artists = await ArtistService.getArtists();

        if (!artists || artists.length === 0) {
            // Нет артистов — скрываем всю секцию, не показываем мусор
            const section = document.getElementById('artists');
            if (section) section.style.display = 'none';
            return;
        }

        artists.forEach(artist => {
            const slide = createArtistSlide(artist);
            wrapper.appendChild(slide);
        });

        initSwiper(artists.length);

    } catch (error) {
        console.error('Ошибка загрузки артистов:', error);
        wrapper.innerHTML = ''; // скрываем при ошибке
    }
}

// ---- Экспортируем instance чтобы main.js мог вызвать update при resize ----
export function getSwiperInstance() {
    return swiperInstance;
}
