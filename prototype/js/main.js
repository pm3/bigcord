/* ============================================================
   BIG CORD – Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initBannerCarousel();
  initCountdown();
  initLabelFilter();
  initProductGrid();
  initProductDetail();
  initCordSwatches();
  initCart();
  initCheckout();
  initLazyLoad();
});

/* ----- Mobile Menu ----- */
function initMobileMenu() {
  const btn = document.getElementById('hamburgerBtn');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    btn.classList.toggle('is-active');
    btn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
    });
  });
}

/* ----- Banner Carousel ----- */
function initBannerCarousel() {
  const slides = document.querySelectorAll('.banner__slide');
  const dots = document.querySelectorAll('.banner__dot');
  const prevBtn = document.getElementById('bannerPrev');
  const nextBtn = document.getElementById('bannerNext');

  if (slides.length === 0) return;

  let current = 0;
  let autoplayTimer = null;
  const INTERVAL = 5000;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() {
    goTo(current + 1);
  }

  function prev() {
    goTo(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(next, INTERVAL);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      startAutoplay();
    });
  });

  /* Touch / swipe support */
  const track = document.getElementById('bannerTrack');
  let startX = 0;
  let dragging = false;

  if (track) {
    track.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      dragging = true;
      stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', e => {
      if (!dragging) return;
      dragging = false;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
      }
      startAutoplay();
    }, { passive: true });
  }

  startAutoplay();
}

/* ----- Countdown Timer ----- */
function initCountdown() {
  const el = document.getElementById('eventCountdown');
  if (!el) return;

  const target = new Date(el.dataset.target).getTime();
  const daysEl = document.getElementById('countDays');
  const hoursEl = document.getElementById('countHours');
  const minutesEl = document.getElementById('countMinutes');
  const secondsEl = document.getElementById('countSeconds');

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function update() {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      daysEl.textContent = '0';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = days;
    hoursEl.textContent = pad(hours);
    minutesEl.textContent = pad(minutes);
    secondsEl.textContent = pad(seconds);
  }

  update();
  setInterval(update, 1000);
}

/* ----- Label Filter (Tutorials listing) ----- */
function initLabelFilter() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.tutorial-card');
  const emptyMsg = document.getElementById('tutorialsEmpty');
  const resetBtn = document.getElementById('resetFilter');

  if (pills.length === 0 || cards.length === 0) return;

  let activeLabels = new Set();

  function applyFilter() {
    let visibleCount = 0;

    cards.forEach(card => {
      if (activeLabels.size === 0) {
        card.classList.remove('is-hidden');
        visibleCount++;
        return;
      }
      const cardLabels = (card.dataset.labels || '').split(/\s+/);
      const match = [...activeLabels].some(l => cardLabels.includes(l));
      card.classList.toggle('is-hidden', !match);
      if (match) visibleCount++;
    });

    if (emptyMsg) {
      emptyMsg.style.display = visibleCount === 0 ? '' : 'none';
    }
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const label = pill.dataset.label;

      if (label === 'all') {
        activeLabels.clear();
        pills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
      } else {
        const allPill = document.querySelector('.filter-pill[data-label="all"]');
        if (allPill) allPill.classList.remove('is-active');

        if (pill.classList.contains('is-active')) {
          pill.classList.remove('is-active');
          activeLabels.delete(label);
          if (activeLabels.size === 0 && allPill) {
            allPill.classList.add('is-active');
          }
        } else {
          pill.classList.add('is-active');
          activeLabels.add(label);
        }
      }

      applyFilter();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeLabels.clear();
      pills.forEach(p => p.classList.remove('is-active'));
      const allPill = document.querySelector('.filter-pill[data-label="all"]');
      if (allPill) allPill.classList.add('is-active');
      applyFilter();
    });
  }
}

/* ----- Product Grid (Category page) ----- */
function initProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const loader = document.getElementById('productsLoader');
  const endMsg = document.getElementById('productsEnd');
  const countEl = document.getElementById('productCount');

  const BATCH = 40;
  const TOTAL = 80;
  let loaded = 0;
  let isLoading = false;

  const COLORS = [
    { name: 'Natural',  hex: 'f5f0e8', text: '8b7355' },
    { name: 'Ivory',    hex: 'fffff0', text: '8b8b7a' },
    { name: 'Blush',    hex: 'fce4ec', text: 'c62828' },
    { name: 'Sage',     hex: 'e8f5e9', text: '2e7d32' },
    { name: 'Sky Blue', hex: 'e3f2fd', text: '1565c0' },
    { name: 'Lavender', hex: 'f3e8ff', text: '6c3fa0' },
    { name: 'Mustard',  hex: 'fff8e1', text: 'f9a825' },
    { name: 'Coral',    hex: 'fff3e0', text: 'e65100' },
    { name: 'Charcoal', hex: 'eceff1', text: '37474f' },
    { name: 'Dusty Rose',hex:'fce4ec', text: 'ad1457' },
    { name: 'Mint',     hex: 'e0f2f1', text: '00695c' },
    { name: 'Peach',    hex: 'fff3e0', text: 'bf360c' },
    { name: 'Olive',    hex: 'f1f8e9', text: '558b2f' },
    { name: 'Terracotta',hex:'fbe9e7', text: 'bf360c' },
    { name: 'Ocean',    hex: 'e0f7fa', text: '00838f' },
    { name: 'Sand',     hex: 'efebe9', text: '6d4c41' },
  ];

  function createProductHTML(index) {
    const color = COLORS[index % COLORS.length];
    const num = index + 1;
    const price = (2.5 + (index % 12) * 0.5).toFixed(2);
    const imgUrl = `https://placehold.co/400x400/${color.hex}/${color.text}?text=${encodeURIComponent(color.name)}`;

    return `
      <div class="product-card">
        <a href="#" class="product-card__image">
          <img
            data-src="${imgUrl}"
            alt="BIG CORD 5mm ${color.name}"
            class="lazy"
          >
        </a>
        <div class="product-card__body">
          <h3 class="product-card__name">
            <a href="#">BIG CORD 5mm Cotton – ${color.name} #${num}</a>
          </h3>
          <span class="product-card__price">${price}&nbsp;€</span>
          <button class="product-card__btn" type="button">
            <span class="btn-text"><i class="fa-solid fa-cart-plus"></i> Add to cart</span>
            <span class="btn-loader"></span>
          </button>
        </div>
      </div>`;
  }

  function loadBatch() {
    if (isLoading || loaded >= TOTAL) return;
    isLoading = true;
    if (loader) loader.classList.add('is-visible');

    setTimeout(() => {
      const end = Math.min(loaded + BATCH, TOTAL);
      let html = '';
      for (let i = loaded; i < end; i++) {
        html += createProductHTML(i);
      }
      grid.insertAdjacentHTML('beforeend', html);
      loaded = end;
      isLoading = false;

      if (loader) loader.classList.remove('is-visible');
      if (countEl) countEl.textContent = TOTAL;

      if (loaded >= TOTAL && endMsg) {
        endMsg.style.display = '';
      }

      initLazyLoad();
      bindAddToCartButtons();
    }, loaded === 0 ? 0 : 800);
  }

  function bindAddToCartButtons() {
    grid.querySelectorAll('.product-card__btn:not([data-bound])').forEach(btn => {
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', () => {
        if (btn.classList.contains('is-loading')) return;
        btn.classList.add('is-loading');
        setTimeout(() => {
          btn.classList.remove('is-loading');
        }, 1000);
      });
    });
  }

  loadBatch();

  const scrollSentinel = document.createElement('div');
  scrollSentinel.id = 'scrollSentinel';
  scrollSentinel.style.height = '1px';
  grid.parentElement.appendChild(scrollSentinel);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && loaded < TOTAL) {
        loadBatch();
      }
    }, { rootMargin: '400px 0px' });
    observer.observe(scrollSentinel);
  }
}

/* ----- Product Detail Page ----- */
function initProductDetail() {
  const chipsWrap = document.getElementById('variantChips');
  const mainImage = document.querySelector('#pdMainImage img');
  const priceEl = document.getElementById('pdPrice');
  const priceVatEl = document.getElementById('pdPriceVat');
  const stockEl = document.getElementById('pdStock');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');
  const addBtn = document.getElementById('pdAddBtn');

  if (!chipsWrap || !addBtn) return;

  const chips = chipsWrap.querySelectorAll('.pd__chip');

  function formatPrice(val) {
    return val.toFixed(2).replace('.', ',') + '\u00a0€';
  }

  function selectChip(chip) {
    chips.forEach(c => c.classList.remove('is-active'));
    chip.classList.add('is-active');

    const price = parseFloat(chip.dataset.price);
    const stock = parseInt(chip.dataset.stock, 10);
    const img = chip.dataset.img;
    const name = chip.textContent.trim();

    if (mainImage && img) {
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.src = img;
        mainImage.alt = 'BIG CORD 5mm Cotton – ' + name;
        mainImage.style.opacity = '1';
      }, 150);
    }

    if (priceEl) priceEl.textContent = formatPrice(price);
    if (priceVatEl) priceVatEl.textContent = formatPrice(price / 1.2) + ' excl. VAT';

    if (stockEl) {
      if (stock > 0) {
        stockEl.innerHTML =
          '<span class="pd__stock-badge pd__stock-badge--in">' +
            '<i class="fa-solid fa-circle-check"></i> In stock' +
          '</span>' +
          '<span class="pd__stock-qty">' + stock + ' pcs available</span>';
        addBtn.classList.remove('is-disabled');
      } else {
        stockEl.innerHTML =
          '<span class="pd__stock-badge pd__stock-badge--out">' +
            '<i class="fa-solid fa-circle-xmark"></i> Out of stock' +
          '</span>';
        addBtn.classList.add('is-disabled');
      }
    }

    if (qtyInput) {
      qtyInput.value = 1;
      qtyInput.max = stock > 0 ? stock : 0;
    }
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => selectChip(chip));
  });

  if (qtyMinus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
  }

  if (qtyPlus && qtyInput) {
    qtyPlus.addEventListener('click', () => {
      let v = parseInt(qtyInput.value, 10) || 1;
      const max = parseInt(qtyInput.max, 10) || 99;
      if (v < max) qtyInput.value = v + 1;
    });
  }

  if (qtyInput) {
    qtyInput.addEventListener('change', () => {
      let v = parseInt(qtyInput.value, 10);
      const max = parseInt(qtyInput.max, 10) || 99;
      if (isNaN(v) || v < 1) v = 1;
      if (v > max) v = max;
      qtyInput.value = v;
    });
  }

  addBtn.addEventListener('click', () => {
    if (addBtn.classList.contains('is-loading') || addBtn.classList.contains('is-disabled')) return;
    addBtn.classList.add('is-loading');
    setTimeout(() => {
      addBtn.classList.remove('is-loading');
    }, 1000);
  });
}

/* ----- Cord Product – Color Swatches ----- */
function initCordSwatches() {
  const grid = document.getElementById('swatchGrid');
  if (!grid) return;

  const mainImage = document.querySelector('#pdMainImage img');
  const titleEl = document.getElementById('pdTitle');
  const priceEl = document.getElementById('pdPrice');
  const priceVatEl = document.getElementById('pdPriceVat');
  const stockEl = document.getElementById('pdStock');
  const addBtn = document.getElementById('pdAddBtn');
  const qtyInput = document.getElementById('qtyInput');
  const qtyMinus = document.getElementById('qtyMinus');
  const qtyPlus = document.getElementById('qtyPlus');

  const PRODUCT_BASE = 'BIG CORD 5mm Cotton';
  const PRICE = 4.50;

  const COLORS = [
    { name: 'Lavender',      bg: 'd8b4fe', fg: '6c3fa0', stock: 23 },
    { name: 'Sage',           bg: 'a5d6a7', fg: '2e7d32', stock: 15 },
    { name: 'Natural',        bg: 'd7ccc8', fg: '5d4037', stock: 42 },
    { name: 'Coral',          bg: 'ff8a65', fg: 'bf360c', stock: 0 },
    { name: 'Mustard',        bg: 'ffd54f', fg: 'f57f17', stock: 8 },
    { name: 'Sky Blue',       bg: '90caf9', fg: '1565c0', stock: 31 },
    { name: 'Charcoal',       bg: '90a4ae', fg: '263238', stock: 6 },
    { name: 'Blush',          bg: 'f48fb1', fg: 'ad1457', stock: 18 },
    { name: 'Mint',           bg: '80cbc4', fg: '00695c', stock: 27 },
    { name: 'Peach',          bg: 'ffab91', fg: 'bf360c', stock: 12 },
    { name: 'Dusty Rose',     bg: 'ce93d8', fg: '6a1b9a', stock: 9 },
    { name: 'Olive',          bg: 'aed581', fg: '33691e', stock: 35 },
    { name: 'Terracotta',     bg: 'bcaaa4', fg: '4e342e', stock: 20 },
    { name: 'Ocean',          bg: '4dd0e1', fg: '006064', stock: 14 },
    { name: 'Sand',           bg: 'd7ccc8', fg: '6d4c41', stock: 40 },
    { name: 'Ivory',          bg: 'fff9c4', fg: 'f9a825', stock: 55 },
    { name: 'Ruby',           bg: 'ef5350', fg: 'b71c1c', stock: 3 },
    { name: 'Navy',           bg: '5c6bc0', fg: '1a237e', stock: 22 },
    { name: 'Forest',         bg: '66bb6a', fg: '1b5e20', stock: 17 },
    { name: 'Burgundy',       bg: 'ad1457', fg: '880e4f', stock: 5 },
    { name: 'Powder Blue',    bg: 'b3e5fc', fg: '01579b', stock: 30 },
    { name: 'Caramel',        bg: 'ffcc80', fg: 'e65100', stock: 25 },
    { name: 'Lilac',          bg: 'b39ddb', fg: '4527a0', stock: 11 },
    { name: 'Eucalyptus',     bg: 'a5d6a7', fg: '2e7d32', stock: 19 },
    { name: 'Stone Grey',     bg: 'bdbdbd', fg: '424242', stock: 33 },
    { name: 'Cinnamon',       bg: 'a1887f', fg: '3e2723', stock: 7 },
    { name: 'Denim',          bg: '64b5f6', fg: '0d47a1', stock: 28 },
    { name: 'Pistachio',      bg: 'c5e1a5', fg: '558b2f', stock: 21 },
    { name: 'Raspberry',      bg: 'ec407a', fg: '880e4f', stock: 0 },
    { name: 'Cappuccino',     bg: 'bcaaa4', fg: '3e2723', stock: 16 },
    { name: 'Aqua',           bg: '4db6ac', fg: '004d40', stock: 24 },
    { name: 'Honey',          bg: 'ffe082', fg: 'ff8f00', stock: 38 },
    { name: 'Slate',          bg: '78909c', fg: '263238', stock: 10 },
    { name: 'Apricot',        bg: 'ffab91', fg: 'd84315', stock: 13 },
    { name: 'Teal',           bg: '26a69a', fg: '004d40', stock: 29 },
    { name: 'Rose Gold',      bg: 'f8bbd0', fg: 'c2185b', stock: 4 },
    { name: 'Mauve',          bg: 'ba68c8', fg: '6a1b9a', stock: 8 },
    { name: 'Butter',         bg: 'fff59d', fg: 'f9a825', stock: 45 },
    { name: 'Cobalt',         bg: '42a5f5', fg: '0d47a1', stock: 2 },
    { name: 'Pumpkin',        bg: 'ff7043', fg: 'bf360c', stock: 6 },
    { name: 'Champagne',      bg: 'ffe0b2', fg: 'e65100', stock: 32 },
    { name: 'Graphite',       bg: '616161', fg: '212121', stock: 19 },
    { name: 'Lemon',          bg: 'fff176', fg: 'f57f17', stock: 26 },
    { name: 'Plum',           bg: '9c27b0', fg: '4a148c', stock: 0 },
    { name: 'Cloud',          bg: 'eceff1', fg: '546e7a', stock: 50 },
    { name: 'Salmon',         bg: 'ef9a9a', fg: 'c62828', stock: 14 },
    { name: 'Jade',           bg: '69f0ae', fg: '1b5e20', stock: 22 },
    { name: 'Tangerine',      bg: 'ffa726', fg: 'e65100', stock: 11 },
    { name: 'Periwinkle',     bg: '9fa8da', fg: '283593', stock: 18 },
    { name: 'Wheat',          bg: 'ffe082', fg: '6d4c41', stock: 37 },
    { name: 'Fuchsia',        bg: 'f06292', fg: '880e4f', stock: 3 },
    { name: 'Smoke',          bg: 'b0bec5', fg: '37474f', stock: 20 },
    { name: 'Copper',         bg: 'e6a27e', fg: '6d4c41', stock: 9 },
    { name: 'Arctic',         bg: 'b2ebf2', fg: '00838f', stock: 41 },
    { name: 'Mocha',          bg: '8d6e63', fg: '3e2723', stock: 15 },
    { name: 'Sunflower',      bg: 'ffee58', fg: 'f57f17', stock: 34 },
    { name: 'Indigo',         bg: '7986cb', fg: '1a237e', stock: 7 },
    { name: 'Cream',          bg: 'fff8e1', fg: '8d6e63', stock: 48 },
    { name: 'Paprika',        bg: 'e53935', fg: 'b71c1c', stock: 0 },
    { name: 'Snow White',     bg: 'fafafa', fg: '9e9e9e', stock: 60 },
  ];

  function formatPrice(val) {
    return val.toFixed(2).replace('.', ',') + '\u00a0€';
  }

  function buildSwatches() {
    let html = '';
    COLORS.forEach((c, i) => {
      const imgUrl = `https://placehold.co/120x120/${c.bg}/${c.fg}?text=${encodeURIComponent(c.name.substring(0, 8))}`;
      const activeClass = i === 0 ? ' is-active' : '';
      const oosClass = c.stock === 0 ? ' is-oos' : '';
      html += `<div class="swatch${activeClass}${oosClass}" data-index="${i}" data-name="${c.name}" data-stock="${c.stock}" data-img="https://placehold.co/600x600/${c.bg}/${c.fg}?text=${encodeURIComponent(c.name)}" title="${c.name}">
        <img src="${imgUrl}" alt="${c.name}" loading="lazy">
        <span class="swatch__tip">${c.name}</span>
      </div>`;
    });
    grid.innerHTML = html;
  }

  function selectSwatch(swatch) {
    grid.querySelectorAll('.swatch').forEach(s => s.classList.remove('is-active'));
    swatch.classList.add('is-active');

    const name = swatch.dataset.name;
    const stock = parseInt(swatch.dataset.stock, 10);
    const img = swatch.dataset.img;

    if (mainImage && img) {
      mainImage.style.opacity = '0';
      setTimeout(() => {
        mainImage.src = img;
        mainImage.alt = PRODUCT_BASE + ' – ' + name;
        mainImage.style.opacity = '1';
      }, 150);
    }

    if (titleEl) titleEl.textContent = PRODUCT_BASE + ' – ' + name;
    if (priceEl) priceEl.textContent = formatPrice(PRICE);
    if (priceVatEl) priceVatEl.textContent = formatPrice(PRICE / 1.2) + ' excl. VAT';

    if (stockEl) {
      if (stock > 0) {
        stockEl.innerHTML =
          '<span class="pd__stock-badge pd__stock-badge--in">' +
            '<i class="fa-solid fa-circle-check"></i> In stock' +
          '</span>' +
          '<span class="pd__stock-qty">' + stock + ' pcs available</span>';
        if (addBtn) addBtn.classList.remove('is-disabled');
      } else {
        stockEl.innerHTML =
          '<span class="pd__stock-badge pd__stock-badge--out">' +
            '<i class="fa-solid fa-circle-xmark"></i> Out of stock' +
          '</span>';
        if (addBtn) addBtn.classList.add('is-disabled');
      }
    }

    if (qtyInput) {
      qtyInput.value = 1;
      qtyInput.max = stock > 0 ? stock : 0;
    }

    /* On mobile, scroll to main image */
    if (window.innerWidth < 768 && mainImage) {
      const target = document.getElementById('pdMainImage');
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 200);
      }
    }
  }

  buildSwatches();

  grid.addEventListener('click', (e) => {
    const swatch = e.target.closest('.swatch');
    if (swatch) selectSwatch(swatch);
  });

  /* Quantity +/- and add-to-cart (if not already bound by initProductDetail) */
  if (qtyMinus && qtyInput && !qtyMinus.dataset.bound) {
    qtyMinus.dataset.bound = '1';
    qtyMinus.addEventListener('click', () => {
      let v = parseInt(qtyInput.value, 10) || 1;
      if (v > 1) qtyInput.value = v - 1;
    });
  }

  if (qtyPlus && qtyInput && !qtyPlus.dataset.bound) {
    qtyPlus.dataset.bound = '1';
    qtyPlus.addEventListener('click', () => {
      let v = parseInt(qtyInput.value, 10) || 1;
      const max = parseInt(qtyInput.max, 10) || 99;
      if (v < max) qtyInput.value = v + 1;
    });
  }

  if (qtyInput && !qtyInput.dataset.bound) {
    qtyInput.dataset.bound = '1';
    qtyInput.addEventListener('change', () => {
      let v = parseInt(qtyInput.value, 10);
      const max = parseInt(qtyInput.max, 10) || 99;
      if (isNaN(v) || v < 1) v = 1;
      if (v > max) v = max;
      qtyInput.value = v;
    });
  }

  if (addBtn && !addBtn.dataset.bound) {
    addBtn.dataset.bound = '1';
    addBtn.addEventListener('click', () => {
      if (addBtn.classList.contains('is-loading') || addBtn.classList.contains('is-disabled')) return;
      addBtn.classList.add('is-loading');
      setTimeout(() => addBtn.classList.remove('is-loading'), 1000);
    });
  }
}

/* ----- Cart Page ----- */
function initCart() {
  const itemsWrap = document.getElementById('cartItems');
  if (!itemsWrap) return;

  const emptyMsg = document.getElementById('cartEmpty');
  const countrySec = document.getElementById('cartCountrySection');
  const shippingSec = document.getElementById('cartShippingSection');
  const paymentSec = document.getElementById('cartPaymentSection');
  const summaryEl = document.getElementById('cartSummary');

  const summarySubtotal = document.getElementById('summarySubtotal');
  const summaryItemCount = document.getElementById('summaryItemCount');
  const summaryShipping = document.getElementById('summaryShipping');
  const summaryPayment = document.getElementById('summaryPayment');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryTotalExVat = document.getElementById('summaryTotalExVat');
  const summaryVat = document.getElementById('summaryVat');
  const summaryDiscountRow = document.getElementById('summaryDiscountRow');
  const summaryDiscount = document.getElementById('summaryDiscount');
  const summaryDiscountLabel = document.getElementById('summaryDiscountLabel');

  const couponForm = document.getElementById('couponForm');
  const couponApplied = document.getElementById('couponApplied');
  const couponInput = document.getElementById('couponInput');
  const couponApplyBtn = document.getElementById('couponApplyBtn');
  const couponError = document.getElementById('couponError');
  const couponRemoveBtn = document.getElementById('couponRemoveBtn');
  const couponBadgeCode = document.getElementById('couponBadgeCode');
  const couponBadgeDesc = document.getElementById('couponBadgeDesc');
  const couponSection = document.getElementById('cartCouponSection');

  const VAT_RATE = 0.20;

  const VALID_COUPONS = {
    'SAVE10':    { type: 'percent', value: 10, desc: '10% off' },
    'WELCOME15': { type: 'percent', value: 15, desc: '15% off' },
    'FLAT5':     { type: 'fixed',   value: 5,  desc: '5 € off' },
  };

  let activeCoupon = null;

  function fmt(val) {
    return val.toFixed(2).replace('.', ',') + '\u00a0€';
  }

  function getSelectedPrice(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? parseFloat(el.dataset.price) || 0 : 0;
  }

  function recalc() {
    const items = itemsWrap.querySelectorAll('.cart-item:not(.is-removing)');
    let subtotal = 0;
    let totalQty = 0;

    items.forEach(item => {
      const price = parseFloat(item.dataset.price);
      const input = item.querySelector('.cart-item__qty-input');
      const qty = parseInt(input.value, 10) || 0;
      const lineTotal = price * qty;
      totalQty += qty;
      subtotal += lineTotal;
      item.querySelector('.cart-item__line-total').textContent = fmt(lineTotal);
    });

    let discount = 0;
    if (activeCoupon) {
      if (activeCoupon.type === 'percent') {
        discount = subtotal * (activeCoupon.value / 100);
      } else {
        discount = Math.min(activeCoupon.value, subtotal);
      }
    }

    const shippingCost = getSelectedPrice('shipping');
    const paymentCost = getSelectedPrice('payment');
    const total = subtotal - discount + shippingCost + paymentCost;
    const totalExVat = total / (1 + VAT_RATE);
    const vat = total - totalExVat;

    if (summaryItemCount) summaryItemCount.textContent = totalQty;
    if (summarySubtotal) summarySubtotal.textContent = fmt(subtotal);
    if (summaryDiscountRow) summaryDiscountRow.style.display = activeCoupon ? '' : 'none';
    if (summaryDiscount && activeCoupon) summaryDiscount.textContent = '- ' + fmt(discount);
    if (summaryDiscountLabel && activeCoupon) summaryDiscountLabel.textContent = activeCoupon.code;
    if (summaryShipping) summaryShipping.textContent = shippingCost === 0 ? 'Free' : fmt(shippingCost);
    if (summaryPayment) summaryPayment.textContent = paymentCost === 0 ? 'Free' : '+ ' + fmt(paymentCost);
    if (summaryTotal) summaryTotal.textContent = fmt(total);
    if (summaryTotalExVat) summaryTotalExVat.textContent = fmt(totalExVat);
    if (summaryVat) summaryVat.textContent = fmt(vat);

    const hasItems = items.length > 0;
    if (emptyMsg) emptyMsg.style.display = hasItems ? 'none' : '';
    if (couponSection) couponSection.style.display = hasItems ? '' : 'none';
    if (countrySec) countrySec.style.display = hasItems ? '' : 'none';
    if (shippingSec) shippingSec.style.display = hasItems ? '' : 'none';
    if (paymentSec) paymentSec.style.display = hasItems ? '' : 'none';
    if (summaryEl) summaryEl.style.display = hasItems ? '' : 'none';
  }

  /* Quantity +/- */
  itemsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-item__qty-btn');
    if (!btn) return;

    const item = btn.closest('.cart-item');
    const input = item.querySelector('.cart-item__qty-input');
    const stock = parseInt(item.dataset.stock, 10);
    const warn = item.querySelector('.cart-item__stock-warn');
    const maxSpan = item.querySelector('.cart-item__stock-max');
    let v = parseInt(input.value, 10) || 1;

    if (btn.dataset.action === 'minus' && v > 1) v--;
    if (btn.dataset.action === 'plus') v++;

    if (v > stock) {
      v = stock;
      if (warn) { warn.style.display = ''; if (maxSpan) maxSpan.textContent = stock; }
    } else {
      if (warn) warn.style.display = 'none';
    }

    input.value = v;
    recalc();
  });

  /* Manual input change */
  itemsWrap.addEventListener('change', (e) => {
    if (!e.target.matches('.cart-item__qty-input')) return;
    const item = e.target.closest('.cart-item');
    const stock = parseInt(item.dataset.stock, 10);
    const warn = item.querySelector('.cart-item__stock-warn');
    const maxSpan = item.querySelector('.cart-item__stock-max');
    let v = parseInt(e.target.value, 10);
    if (isNaN(v) || v < 1) v = 1;
    if (v > stock) {
      v = stock;
      if (warn) { warn.style.display = ''; if (maxSpan) maxSpan.textContent = stock; }
    } else {
      if (warn) warn.style.display = 'none';
    }
    e.target.value = v;
    recalc();
  });

  /* Remove item */
  itemsWrap.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-item__remove');
    if (!btn) return;
    const item = btn.closest('.cart-item');
    item.style.maxHeight = item.offsetHeight + 'px';
    requestAnimationFrame(() => {
      item.classList.add('is-removing');
      setTimeout(() => {
        item.remove();
        recalc();
      }, 350);
    });
  });

  /* Shipping / payment radio */
  function bindRadios(containerId) {
    const wrap = document.getElementById(containerId);
    if (!wrap) return;
    wrap.addEventListener('change', () => {
      wrap.querySelectorAll('.cart-option').forEach(opt => {
        const radio = opt.querySelector('input[type="radio"]');
        opt.classList.toggle('cart-option--checked', radio && radio.checked);
      });
      recalc();
    });
  }

  bindRadios('shippingOptions');
  bindRadios('paymentOptions');

  /* Coupon apply */
  if (couponApplyBtn && couponInput) {
    function applyCoupon() {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) return;

      const coupon = VALID_COUPONS[code];
      if (!coupon) {
        if (couponError) { couponError.textContent = 'Invalid coupon code'; couponError.style.display = ''; }
        couponInput.focus();
        return;
      }

      activeCoupon = { ...coupon, code: code };
      if (couponError) couponError.style.display = 'none';
      if (couponForm) couponForm.style.display = 'none';
      if (couponApplied) couponApplied.style.display = '';
      if (couponBadgeCode) couponBadgeCode.textContent = code;
      if (couponBadgeDesc) couponBadgeDesc.textContent = '– ' + coupon.desc;
      recalc();
    }

    couponApplyBtn.addEventListener('click', applyCoupon);
    couponInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
      if (couponError) couponError.style.display = 'none';
    });
  }

  /* Coupon remove */
  if (couponRemoveBtn) {
    couponRemoveBtn.addEventListener('click', () => {
      activeCoupon = null;
      if (couponForm) couponForm.style.display = '';
      if (couponApplied) couponApplied.style.display = 'none';
      if (couponInput) couponInput.value = '';
      recalc();
    });
  }

  recalc();
}

/* ----- Checkout Page ----- */
function initCheckout() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  const billingSame = document.getElementById('coBillingSame');
  const billingFields = document.getElementById('coBillingFields');
  const noteToggle = document.getElementById('coNoteToggle');
  const noteField = document.getElementById('coNoteField');

  /* Toggle billing address */
  if (billingSame && billingFields) {
    billingSame.addEventListener('change', () => {
      billingFields.style.display = billingSame.checked ? 'none' : '';
    });
  }

  /* Toggle order note */
  if (noteToggle && noteField) {
    noteToggle.addEventListener('change', () => {
      noteField.style.display = noteToggle.checked ? '' : 'none';
      if (noteToggle.checked) {
        noteField.querySelector('textarea').focus();
      }
    });
  }

  /* Form validation */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    form.querySelectorAll('.co-input.is-error').forEach(el => el.classList.remove('is-error'));

    let firstError = null;

    form.querySelectorAll('[required]').forEach(el => {
      if (el.type === 'checkbox' && !el.checked) {
        el.closest('.co-checkbox-wrap').querySelector('.co-checkbox').style.borderColor = '#c62828';
        if (!firstError) firstError = el;
      } else if (el.type !== 'checkbox' && !el.value.trim()) {
        el.classList.add('is-error');
        if (!firstError) firstError = el;
      }
    });

    const email = document.getElementById('coEmail');
    if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      email.classList.add('is-error');
      if (!firstError) firstError = email;
    }

    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (firstError.focus) firstError.focus();
      return;
    }

    const btn = document.getElementById('coSubmitBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-loader" style="display:block;width:20px;height:20px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:btn-spin .6s linear infinite;"></span>';
      setTimeout(() => {
        alert('Order placed successfully! (demo)');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Place Order';
      }, 1500);
    }
  });

  /* Clear error on input */
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-error')) {
      e.target.classList.remove('is-error');
    }
  });

  form.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.required) {
      const cb = e.target.closest('.co-checkbox-wrap').querySelector('.co-checkbox');
      if (cb) cb.style.borderColor = '';
    }
  });
}

/* ----- Lazy Loading Images ----- */
let _lazyObserver = null;

function initLazyLoad() {
  const lazyImages = document.querySelectorAll('img.lazy:not([src])');
  if (lazyImages.length === 0) return;

  if ('IntersectionObserver' in window) {
    if (!_lazyObserver) {
      _lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
              img.addEventListener('error', () => {
                img.classList.add('loaded');
                img.alt = 'Image not available';
              }, { once: true });
            }
            _lazyObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '200px 0px'
      });
    }

    lazyImages.forEach(img => _lazyObserver.observe(img));
  } else {
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.classList.add('loaded');
      }
    });
  }
}
