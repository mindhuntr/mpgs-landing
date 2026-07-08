// 0. Header scroll, progress bar, mobile nav
const header = document.getElementById('header');
const progress = document.getElementById('scroll-progress');
const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');

function updateHeader() {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPct = (scrollY / docHeight) * 100;

    header.classList.toggle('scrolled', scrollY > 80);
    progress.style.width = Math.min(progressPct, 100) + '%';
}

window.addEventListener('scroll', updateHeader, { passive: true });
window.addEventListener('resize', updateHeader, { passive: true });
updateHeader();

// Smooth scroll for nav links
document.querySelectorAll('.header-nav a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        // Close mobile nav
        nav.classList.remove('open');
        navToggle.classList.remove('open');
    });
});

// Mobile nav toggle
navToggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    navToggle.classList.toggle('open');
});

// 1. Staggered Text Reveal for Hero
const titleText = "Modern Furniture For All";
const titleEl = document.getElementById('hero-title');
const words = titleText.split(' ');

words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'stagger-word';
    const innerSpan = document.createElement('span');
    innerSpan.textContent = word;
    innerSpan.style.animationDelay = `${1.5 + (index * 0.2)}s`;
    wordSpan.appendChild(innerSpan);
    titleEl.appendChild(wordSpan);
});

// 2. Intersection Observer for Scroll Reveals
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// 3. Hero Canvas Particles
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
    const gold = getComputedStyle(document.documentElement).getPropertyValue('--gold-muted').trim() || '#b8a99a';
    const surface = getComputedStyle(document.documentElement).getPropertyValue('--on-surface-variant').trim() || '#4f453c';
    this.color = Math.random() > 0.5 ? gold : surface;
    this.opacity = Math.random() * 0.5 + 0.1;
}
update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }
    draw() {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    particles = [];
    for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

window.addEventListener('resize', resize);
resize();
initParticles();
animateParticles();

// ════════════════════════════════════════════════
// 4. 3D Flip-Book Viewer
// ════════════════════════════════════════════════

const CATALOGUES = [
    { id: 'a003', name: 'A003 Chair Collection', pages: 101, pad: 3, pdf: 'catalaogues/A003  chair furniture.pdf' },
    { id: 'a249', name: 'A249 Chair Collection', pages: 21, pad: 2, pdf: 'catalaogues/A249  chair furniture.pdf' },
    { id: 'a290', name: 'A290 Chair Collection', pages: 57, pad: 2, pdf: 'catalaogues/A290  chair furniture.pdf' },
    { id: 'a298', name: 'A298 Chair Collection', pages: 25, pad: 2, pdf: 'catalaogues/A298  chair furniture.pdf' },
    { id: 'a303', name: 'A303 Chair Collection', pages: 6, pad: 0, pdf: 'catalaogues/A303   chair furniture.pdf' },
    { id: 'aimeixuan_full', name: 'Aimeixuan Full Collection', pages: 177, pad: 0, pdf: 'catalaogues/爱美轩全图.pdf' },
    { id: 'aimeixuan_2025', name: 'Aimeixuan 2025 Catalogue', pages: 152, pad: 0, pdf: 'catalaogues/爱美轩图册2025更 2.pdf' },
    { id: 'aimeixuan_minimal', name: 'Aimeixuan Minimalist Series', pages: 68, pad: 0, pdf: 'catalaogues/爱美轩极简系列.pdf' },
];

// DOM refs
const fbOverlay = document.getElementById('flipbook-overlay');
const fbPageWrap = document.getElementById('fb-page-wrap');
const fbTitle = document.getElementById('fb-title');
const fbCounter = document.getElementById('fb-counter');
const fbDownload = document.getElementById('fb-download');
const fbPrev = document.getElementById('fb-prev');
const fbNext = document.getElementById('fb-next');
const fbHitLeft = document.getElementById('fb-hit-left');
const fbHitRight = document.getElementById('fb-hit-right');
const fbClose = document.getElementById('fb-close');

let currentCat = null;
let currentPage = 0;
let isFlipping = false;

function pageUrl(catId, pageNum, pad) {
    if (pad === 0) return `catalaogues/pages/${catId}/page-${pageNum}.jpg`;
    return `catalaogues/pages/${catId}/page-${String(pageNum).padStart(pad, '0')}.jpg`;
}

function preloadImage(src) {
    const img = new Image();
    img.src = src;
}

function preloadNeighbors(cat, page) {
    for (let i = -2; i <= 2; i++) {
        const n = page + i;
        if (n >= 1 && n <= cat.pages) {
            preloadImage(pageUrl(cat.id, n, cat.pad));
        }
    }
}

function renderPage(cat, pageNum) {
    const src = pageUrl(cat.id, pageNum, cat.pad);
    const isEnd = pageNum === 1 || pageNum === cat.pages;
    const label = pageNum === 1 ? 'Cover' : pageNum === cat.pages ? 'Back Cover' : `Product ${pageNum - 1}`;

    return `
        <div class="flipbook-page static" style="z-index:2;">
            <img src="${src}" alt="${cat.name} - Page ${pageNum}" loading="${pageNum <= 3 ? 'eager' : 'lazy'}" />
            <div class="page-label">${label}</div>
        </div>
    `;
}

function updateInfo(cat, page) {
    fbTitle.textContent = cat.name;
    fbCounter.textContent = `Page ${page} of ${cat.pages}`;
}

function openFlipbook(catId) {
    const cat = CATALOGUES.find(c => c.id === catId);
    if (!cat) return;

    currentCat = cat;
    currentPage = 1;
    isFlipping = false;

    // Set download link
    fbDownload.href = cat.pdf;

    // Render initial page
    fbPageWrap.innerHTML = renderPage(cat, 1);
    updateInfo(cat, 1);

    // Preload neighbors
    preloadNeighbors(cat, 1);

    // Update nav buttons
    fbPrev.classList.add('disabled');
    fbNext.classList.remove('disabled');

    // Remove active tabindex from body scroll
    document.body.style.overflow = 'hidden';

    // Show
    fbOverlay.classList.add('active');

    // Focus trap
    fbClose.focus();
}

function closeFlipbook() {
    fbOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentCat = null;
    currentPage = 0;
}

function goToPage(targetPage) {
    if (!currentCat || isFlipping) return;
    if (targetPage < 1 || targetPage > currentCat.pages) return;
    if (targetPage === currentPage) return;

    isFlipping = true;
    const cat = currentCat;
    const prevPage = currentPage;
    const goingForward = targetPage > prevPage;

    // Create the new page element off-screen (hidden behind the current one)
    const newPageEl = document.createElement('div');
    newPageEl.className = 'flipbook-page';
    newPageEl.style.zIndex = '10';
    newPageEl.innerHTML = `
        <img src="${pageUrl(cat.id, targetPage, cat.pad)}" alt="${cat.name} - Page ${targetPage}" />
        <div class="page-label">${targetPage === 1 ? 'Cover' : targetPage === cat.pages ? 'Back Cover' : `Product ${targetPage - 1}`}</div>
    `;

    // Existing page
    const oldPageEl = fbPageWrap.querySelector('.flipbook-page');
    
    if (goingForward) {
        // Old page flips away to the left
        oldPageEl.classList.remove('static');
        oldPageEl.classList.add('flipping');
        // New page fades in behind
        newPageEl.classList.add('fading-in');
    } else {
        // Old page fades out
        oldPageEl.classList.remove('static');
        oldPageEl.classList.add('fading-out');
        // New page flips in from the left
        newPageEl.classList.add('flipping-back');
    }

    // Add new page to DOM
    fbPageWrap.appendChild(newPageEl);

    // Clean up after animation
    const cleanup = () => {
        fbPageWrap.innerHTML = renderPage(cat, targetPage);
        currentPage = targetPage;
        updateInfo(cat, targetPage);
        preloadNeighbors(cat, targetPage);

        fbPrev.classList.toggle('disabled', targetPage === 1);
        fbNext.classList.toggle('disabled', targetPage === cat.pages);

        isFlipping = false;
    };

    setTimeout(cleanup, 700);
}

function nextPage() {
    if (!currentCat || isFlipping) return;
    if (currentPage < currentCat.pages) {
        goToPage(currentPage + 1);
    }
}

function prevPage() {
    if (!currentCat || isFlipping) return;
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

// ── Wire up catalogue cards ──
document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('click', (e) => {
        const catId = card.dataset.catalogue;
        if (catId) {
            e.preventDefault();
            openFlipbook(catId);
        }
    });
});

// ── Flip-book event listeners ──
fbClose.addEventListener('click', closeFlipbook);
fbPrev.addEventListener('click', prevPage);
fbNext.addEventListener('click', nextPage);
fbHitLeft.addEventListener('click', prevPage);
fbHitRight.addEventListener('click', nextPage);

// Keyboard
document.addEventListener('keydown', (e) => {
    if (!fbOverlay.classList.contains('active')) return;
    if (e.key === 'Escape') closeFlipbook();
    if (e.key === 'ArrowLeft') prevPage();
    if (e.key === 'ArrowRight') nextPage();
});

// Close on overlay backdrop click (not on child elements)
fbOverlay.addEventListener('click', (e) => {
    if (e.target === fbOverlay) closeFlipbook();
});





