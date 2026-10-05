// ============================================================
// JAMIAH ANAYAH INTERNATIONAL SCHOOL — Main JS v2
// Features: SPA routing, image slider, scroll reveal,
//           counter animation, mobile nav, form submit
// ============================================================

// ── SPA Page Routing ─────────────────────────────────────────
const pages     = document.querySelectorAll('.page');
const allNavLinks = document.querySelectorAll('[data-page]');

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  allNavLinks.forEach(l => l.classList.remove('active'));

  const target = document.getElementById('page-' + pageId);
  if (target) {
    target.classList.add('active');
    // Re-trigger reveal animations on newly shown page
    setTimeout(() => initReveal(), 50);
  }

  allNavLinks.forEach(l => {
    if (l.dataset.page === pageId) l.classList.add('active');
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile nav
  const mobileNav = document.querySelector('.mobile-nav');
  const hamburger = document.querySelector('.hamburger');
  if (mobileNav) mobileNav.classList.remove('open');
  if (hamburger) hamburger.classList.remove('open');
}

allNavLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

// ── Hamburger / Mobile Nav ────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileNav.classList.toggle('open');
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
      hamburger.classList.remove('open');
      mobileNav.classList.remove('open');
    }
  });
}

// ── Image Slider ──────────────────────────────────────────────
class Slider {
  constructor(el) {
    this.el       = el;
    this.track    = el.querySelector('.slider-track');
    this.slides   = Array.from(el.querySelectorAll('.slide'));
    this.dotsWrap = el.querySelector('.slider-dots');
    this.prevBtn  = el.querySelector('.slider-prev');
    this.nextBtn  = el.querySelector('.slider-next');
    this.current  = 0;
    this.total    = this.slides.length;
    this.timer    = null;
    this.autoDelay = 4500;
    this.isDragging = false;
    this.startX   = 0;
    this.diffX    = 0;

    if (this.total < 2) return;
    this.buildDots();
    this.goTo(0);
    this.startAuto();
    this.bindEvents();
  }

  buildDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    this.slides.forEach((_, i) => {
      const d = document.createElement('button');
      d.className = 'slider-dot';
      d.setAttribute('aria-label', 'Slide ' + (i + 1));
      d.addEventListener('click', () => { this.goTo(i); this.resetAuto(); });
      this.dotsWrap.appendChild(d);
    });
    this.dots = Array.from(this.dotsWrap.querySelectorAll('.slider-dot'));
  }

  goTo(idx) {
    this.slides[this.current].classList.remove('active');
    this.current = (idx + this.total) % this.total;
    this.slides[this.current].classList.add('active');
    this.track.style.transform = `translateX(-${this.current * 100}%)`;
    if (this.dots) {
      this.dots.forEach((d, i) => d.classList.toggle('active', i === this.current));
    }
  }

  next() { this.goTo(this.current + 1); }
  prev() { this.goTo(this.current - 1); }

  startAuto() {
    this.timer = setInterval(() => this.next(), this.autoDelay);
  }
  resetAuto() {
    clearInterval(this.timer);
    this.startAuto();
  }

  bindEvents() {
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => { this.prev(); this.resetAuto(); });
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.next(); this.resetAuto(); });

    // Pause on hover
    this.el.addEventListener('mouseenter', () => clearInterval(this.timer));
    this.el.addEventListener('mouseleave', () => this.startAuto());

    // Touch/swipe
    this.el.addEventListener('touchstart', e => {
      this.startX = e.touches[0].clientX;
    }, { passive: true });
    this.el.addEventListener('touchend', e => {
      this.diffX = e.changedTouches[0].clientX - this.startX;
      if (Math.abs(this.diffX) > 40) {
        this.diffX < 0 ? this.next() : this.prev();
        this.resetAuto();
      }
    }, { passive: true });

    // Keyboard
    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { this.prev(); this.resetAuto(); }
      if (e.key === 'ArrowRight'){ this.next(); this.resetAuto(); }
    });
  }
}

// Init slider
const sliderEl = document.querySelector('.slider-section');
if (sliderEl) new Slider(sliderEl);

// ── Scroll Reveal ─────────────────────────────────────────────
function initReveal() {
  const revealEls = document.querySelectorAll('.page.active .reveal');
  if (!revealEls.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, i * 80); // stagger
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

  revealEls.forEach(el => obs.observe(el));
}

// ── Counter Animation ─────────────────────────────────────────
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const suffix   = el.dataset.suffix || '';
  const duration = 1800;
  const start    = performance.now();

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ── Contact Form ──────────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn     = contactForm.querySelector('button[type=submit]');
    const success = document.getElementById('form-success');
    const origTxt = btn.innerHTML;

    btn.innerHTML  = '<span style="animation:spin .8s linear infinite;display:inline-block">⏳</span> Sending…';
    btn.disabled   = true;

    try {
      const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        contactForm.reset();
        if (success) success.style.display = 'block';
        btn.innerHTML = '✅ Message Sent!';
        setTimeout(() => {
          btn.innerHTML = origTxt;
          btn.disabled  = false;
          if (success) success.style.display = 'none';
        }, 5000);
      } else {
        throw new Error();
      }
    } catch {
      btn.innerHTML = origTxt;
      btn.disabled  = false;
      alert('Could not send message. Please email us directly.');
    }
  });
}

// ── Init ──────────────────────────────────────────────────────
showPage('home');

// ── Lightbox ──────────────────────────────────────────────────
(function() {
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose   = document.getElementById('lb-close');
  const lbPrev    = document.getElementById('lb-prev');
  const lbNext    = document.getElementById('lb-next');

  if (!lightbox) return;

  let items = [];
  let current = 0;

  function openLightbox(index) {
    current = index;
    const item = items[current];
    lbImg.src        = item.src;
    lbImg.alt        = item.alt;
    lbCaption.textContent = item.caption;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbImg.style.opacity = '0';
    lbImg.onload = () => { lbImg.style.opacity = '1'; lbImg.style.transition = 'opacity .3s'; };
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigate(dir) {
    current = (current + dir + items.length) % items.length;
    openLightbox(current);
  }

  // Bind gallery items — re-scan on every page show
  function bindGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    if (!galleryItems.length) return;

    items = Array.from(galleryItems).map(el => ({
      src:     el.querySelector('img').src,
      alt:     el.querySelector('img').alt,
      caption: el.querySelector('.gallery-caption')?.textContent || ''
    }));

    galleryItems.forEach((el, i) => {
      el.style.cursor = 'zoom-in';
      // Remove old listeners by cloning
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);
      clone.addEventListener('click', () => openLightbox(i));
    });
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => navigate(-1));
  lbNext.addEventListener('click',  () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });

  // Re-bind gallery whenever history page is shown
  const origShowPage = window._showPage || showPage;
  document.querySelectorAll('[data-page="history"]').forEach(link => {
    link.addEventListener('click', () => setTimeout(bindGallery, 100));
  });

  // Also bind on init if history is already active
  setTimeout(bindGallery, 200);
})();
