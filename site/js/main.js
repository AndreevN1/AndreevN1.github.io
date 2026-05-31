/* ═══════════════════════════════════════════════════════════════
   main.js — Интерактивность сайта ПЗ
   Фичи: 2 KPI-счётчик | 3 Клавиатура | 4 Зум | 8 Прогресс | 9 Меню | 10 Якорь
═══════════════════════════════════════════════════════════════ */


/* ──────────────────────────────────────────────────────────────
   8. ПРОГРЕСС ЧТЕНИЯ
   Тонкая полоска под шапкой показывает % прокрутки
────────────────────────────────────────────────────────────── */
function initReadingProgress() {
    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    const content = document.querySelector('.content-center');
    if (!content) return;

    content.addEventListener('scroll', () => {
        const max = content.scrollHeight - content.clientHeight;
        const pct = max > 0 ? (content.scrollTop / max) * 100 : 0;
        bar.style.width = pct + '%';
    });
}

/* ──────────────────────────────────────────────────────────────
   4. ЗУМ СХЕМ ПО КЛИКУ
   Клик на схему → модальное окно на весь экран
────────────────────────────────────────────────────────────── */
let zoomOverlay = null;

function closeZoom() {
    if (zoomOverlay) {
        zoomOverlay.classList.remove('zoom-visible');
        setTimeout(() => {
            zoomOverlay?.remove();
            zoomOverlay = null;
        }, 250);
    }
}

function initImageZoom() {
    const selectors = '.scheme-image, .defense-img-row img, figure img';
    document.querySelectorAll(selectors).forEach(img => {
        img.style.cursor = 'zoom-in';
        img.title = 'Нажмите для увеличения';

        img.addEventListener('click', () => {
            closeZoom();
            zoomOverlay = document.createElement('div');
            zoomOverlay.id = 'zoom-overlay';
            zoomOverlay.innerHTML = `
                <div class="zoom-container">
                    <button class="zoom-close" title="Закрыть (Esc)">✕</button>
                    <img src="${img.src}" alt="${img.alt}" class="zoom-img">
                    <p class="zoom-caption">${img.closest('figure')?.querySelector('figcaption')?.textContent
                        || img.alt || ''}</p>
                </div>`;
            document.body.appendChild(zoomOverlay);

            requestAnimationFrame(() => zoomOverlay.classList.add('zoom-visible'));

            zoomOverlay.addEventListener('click', e => {
                if (e.target === zoomOverlay || e.target.classList.contains('zoom-close')) closeZoom();
            });
        });
    });
}

/* ──────────────────────────────────────────────────────────────
   2. СЧЁТЧИК KPI-ЧИСЕЛ (только defense-страницы)
   Числа анимируются от 0 до значения при появлении
────────────────────────────────────────────────────────────── */
function animateCounter(el, target, duration = 1200) {
    const isNumeric = /^[\d\s]+$/.test(target.trim());
    if (!isNumeric) return; // «STP», «GitHub» — не анимируем

    const num = parseInt(target.replace(/\s/g, ''));
    if (isNaN(num) || num === 0) return;

    const start = performance.now();
    const fmt = n => n.toLocaleString('ru-RU'); // 413 713

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = fmt(Math.floor(eased * num));
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target; // финальное значение (оригинальный текст)
    }
    requestAnimationFrame(step);
}

function initKPICounters() {
    const nums = document.querySelectorAll('.defense-num-val');
    if (nums.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const original = el.textContent.trim();
                animateCounter(el, original);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    nums.forEach(el => observer.observe(el));
}

/* ──────────────────────────────────────────────────────────────
   10. АКТИВНЫЙ ЯКОРЬ В МЕНЮ ПРИ ПРОКРУТКЕ
   Подсвечивает пункт меню соответствующий видимому разделу
────────────────────────────────────────────────────────────── */
function initScrollSpy() {
    const content = document.querySelector('.content-center');
    const currentPage = location.pathname.split('/').pop() || 'index.html';

    // Только на страницах с якорями
    const anchorPages = ['project.html','operation.html','economy.html',
                         'technology.html','theoretical.html','practical.html'];
    if (!anchorPages.includes(currentPage) || !content) return;

    const sections = content.querySelectorAll('[id]');
    if (sections.length === 0) return;

    const menuLinks = document.querySelectorAll('.toc-menu a[href*="#"]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;

            menuLinks.forEach(link => {
                const href = link.getAttribute('href');
                const isMatch = href.includes(`#${id}`);
                link.classList.toggle('anchor-active', isMatch);
                // Прокручиваем меню к активному пункту
                if (isMatch) {
                    link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                }
            });
        });
    }, {
        root: content,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(s => observer.observe(s));
}

/* ──────────────────────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    initReadingProgress();   // 8
    initImageZoom();         // 4
    initKPICounters();       // 2
    initScrollSpy();         // 10
});
