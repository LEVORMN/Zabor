/* =============================================================
   ЧЕСТНЫЙ ЗАБОР — main.js
   Vanilla JS, no dependencies
============================================================= */

'use strict';

/* ── Calculator config ───────────────────────────────────── */
const CALC = {
  basePrices: { profnastil: 890, euroshtaket: 1100, '3d': 1350, wood: 1200 },
  heightMult: { '1.5': 0.85, '1.8': 1.0, '2.0': 1.15, '2.5': 1.4 },
  foundationAdd: { none: 0, post: 200, strip: 450 },
  gatesPrice: { none: 0, swing: 38000, sliding: 58000, auto: 88000 },
  wicketPrice: { no: 0, yes: 12000 },
  distAdd(km) {
    if (km <= 30)  return 0;
    if (km <= 60)  return 7000;
    if (km <= 100) return 14000;
    return 22000;
  }
};

/* ── State ───────────────────────────────────────────────── */
const state = {
  type:       'profnastil',
  length:     50,
  height:     '1.8',
  foundation: 'none',
  gates:      'none',
  wicket:     'no',
  dist:       30,
};

/* ── Lightbox photos ─────────────────────────────────────── */
const PHOTOS = [
  { src: 'Fotos/photo_2025-09-14_19-04-06.jpg',  caption: 'Профнастил · 45 м · Москва'           },
  { src: 'Fotos/photo_2025-09-15_13-30-28.jpg',  caption: 'Евроштакетник · 60 м · Красногорск'   },
  { src: 'Fotos/photo_2025-09-15_13-30-14.jpg',  caption: 'Евроштакетник · 80 м · Одинцово'      },
  { src: 'Fotos/photo_2025-09-14_18-16-54.jpg',  caption: 'Профнастил · 35 м · Балашиха'         },
  { src: 'Fotos/photo_2025-08-30_00-43-25.jpg',  caption: 'Евроштакетник · 120 м · Люберцы'      },
];
let currentPhoto = 0;

/* ── DOMContentLoaded ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initDrawer();
  initCalculator();
  initFaq();
  initReveal();
  initSmoothScroll();
  initDialogBackdropClose();
});

/* ============================================================
   HEADER — sticky shadow on scroll
============================================================ */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ============================================================
   DRAWER — mobile menu
============================================================ */
function initDrawer() {
  const burger  = document.getElementById('burger');
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  if (!burger || !drawer) return;

  burger.addEventListener('click', () => {
    const isOpen = drawer.classList.contains('is-open');
    isOpen ? closeDrawer() : openDrawer();
  });
}

function openDrawer() {
  const burger  = document.getElementById('burger');
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-visible');
  burger.classList.add('is-open');
  burger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  const burger  = document.getElementById('burger');
  const drawer  = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-visible');
  burger.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ============================================================
   CALCULATOR
============================================================ */
function initCalculator() {
  // Option groups
  initOptGroup('calcType',       'type');
  initOptGroup('calcHeight',     'height');
  initOptGroup('calcFoundation', 'foundation');
  initOptGroup('calcGates',      'gates');
  initOptGroup('calcWicket',     'wicket');

  // Sliders
  const lengthSlider = document.getElementById('lengthSlider');
  const lengthVal    = document.getElementById('lengthVal');
  const distSlider   = document.getElementById('distSlider');
  const distVal      = document.getElementById('distVal');

  if (lengthSlider) {
    lengthSlider.addEventListener('input', () => {
      state.length = Number(lengthSlider.value);
      lengthVal.textContent = state.length;
      updatePrice();
    });
  }

  if (distSlider) {
    distSlider.addEventListener('input', () => {
      state.dist = Number(distSlider.value);
      distVal.textContent = state.dist;
      updatePrice();
    });
  }

  updatePrice();
}

function initOptGroup(groupId, stateKey) {
  const group = document.getElementById(groupId);
  if (!group) return;

  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.calc__opt');
    if (!btn) return;
    group.querySelectorAll('.calc__opt').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    state[stateKey] = btn.dataset.value;
    updatePrice();
  });
}

function calcTotal() {
  const base      = CALC.basePrices[state.type] || 890;
  const hMult     = CALC.heightMult[state.height] || 1;
  const foundAdd  = CALC.foundationAdd[state.foundation] || 0;
  const gates     = CALC.gatesPrice[state.gates] || 0;
  const wicket    = CALC.wicketPrice[state.wicket] || 0;
  const dist      = CALC.distAdd(state.dist);

  const perMeter  = (base * hMult) + foundAdd;
  return Math.round(perMeter * state.length + gates + wicket + dist);
}

function updatePrice() {
  const priceEl = document.getElementById('calcPrice');
  if (!priceEl) return;

  const total = calcTotal();
  const lo    = Math.round(total * 0.92);
  const hi    = Math.round(total * 1.10);

  priceEl.textContent = formatPrice(lo) + ' — ' + formatPrice(hi) + ' ₽';
}

function formatPrice(n) {
  return n.toLocaleString('ru-RU');
}

function submitCalcForm() {
  const input = document.getElementById('calcPhone');
  if (!input) return;

  const phone = input.value.trim();
  if (phone.replace(/\D/g, '').length < 10) {
    input.focus();
    input.style.borderColor = '#e74c3c';
    setTimeout(() => { input.style.borderColor = ''; }, 1500);
    return;
  }

  // Success state — replace lead form with thank you
  const lead = input.closest('.calc__lead');
  if (lead) {
    lead.innerHTML = `
      <div style="text-align:center;padding:12px 0">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#27AE60" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <p style="color:#fff;font-weight:700;margin-top:10px;font-size:16px">Заявка принята!</p>
        <p style="color:rgba(255,255,255,.6);font-size:14px;margin-top:4px">Перезвоним в течение 15 минут.</p>
      </div>`;
  }
}

/* ============================================================
   FAQ — accordion
============================================================ */
function initFaq() {
  // Open first item by default
  const firstItem = document.querySelector('.faq__item');
  if (firstItem) {
    const firstA = firstItem.querySelector('.faq__a');
    if (firstA) firstA.removeAttribute('hidden');
  }
}

function toggleFaq(btn) {
  const item   = btn.closest('.faq__item');
  const answer = item.querySelector('.faq__a');
  const isOpen = btn.getAttribute('aria-expanded') === 'true';

  if (isOpen) {
    answer.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  } else {
    answer.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
}

/* ============================================================
   MODAL
============================================================ */
function openModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  resetModal();
  modal.showModal();
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    document.getElementById('modalName')?.focus();
  }, 50);
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.close();
  document.body.style.overflow = '';
}

function resetModal() {
  const formWrap = document.getElementById('modalFormWrap');
  const success  = document.getElementById('modalSuccess');
  const form     = document.getElementById('modalForm');
  if (formWrap) formWrap.hidden = false;
  if (success)  success.hidden = true;
  if (form)     form.reset();
}

function submitModalForm(e) {
  e.preventDefault();
  const form  = e.target;
  const name  = document.getElementById('modalName')?.value.trim() || '';
  const phone = document.getElementById('modalPhone')?.value.trim() || '';

  if (!name || phone.replace(/\D/g, '').length < 10) return;

  const formWrap     = document.getElementById('modalFormWrap');
  const success      = document.getElementById('modalSuccess');
  const successTitle = document.getElementById('modalSuccessTitle');

  if (formWrap) formWrap.hidden = true;
  if (success)  {
    success.hidden = false;
    if (successTitle) successTitle.textContent = `Отлично, ${name}!`;
  }
}

/* ============================================================
   LIGHTBOX
============================================================ */
function openLightbox(index) {
  const lb      = document.getElementById('lightbox');
  const img     = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  if (!lb || !img) return;

  currentPhoto = index;
  img.src         = PHOTOS[index].src;
  img.alt         = PHOTOS[index].caption;
  caption.textContent = PHOTOS[index].caption;
  lb.showModal();
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (lb) lb.close();
}

function lightboxNav(dir) {
  const img     = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  currentPhoto  = (currentPhoto + dir + PHOTOS.length) % PHOTOS.length;
  if (img)     { img.src = PHOTOS[currentPhoto].src; img.alt = PHOTOS[currentPhoto].caption; }
  if (caption) caption.textContent = PHOTOS[currentPhoto].caption;
}

/* ============================================================
   CTA FORM
============================================================ */
function submitCtaForm(e) {
  e.preventDefault();
  const form    = document.getElementById('ctaForm');
  const success = document.getElementById('ctaSuccess');
  if (form)    { form.hidden = true; }
  if (success) { success.hidden = false; }
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
============================================================ */
function initReveal() {
  const targets = document.querySelectorAll(
    '.service-card, .advantage, .review-card, .process__step, .portfolio__item, .faq__item'
  );
  if (!targets.length || !('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  targets.forEach(el => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

/* ============================================================
   SMOOTH SCROLL for anchor links
============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const headerH = document.getElementById('header')?.offsetHeight || 68;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ============================================================
   CLOSE dialogs on backdrop click
============================================================ */
function initDialogBackdropClose() {
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const clickedOutside =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
      if (clickedOutside) dialog.close();
    });
  });

  // ESC key also handled natively by <dialog>
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  });
}
