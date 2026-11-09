/* ==========================================================================
   E-BIZ Technics — Main Script (vanilla JS, no build step)
   --------------------------------------------------------------------------
   Every feature is wrapped in its own function and only runs if the related
   markup exists on the page, so this one file serves every page.
   ========================================================================== */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Icons (Lucide via CDN) ---------- */
  function initIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': 1.9, 'aria-hidden': 'true' } });
    }
  }

  /* ---------- Theme (dark default, remembers choice) ---------- */
  function initTheme() {
    const toggle = $('.theme-toggle');
    if (!toggle) return;
    const root = document.documentElement;
    const sync = () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      toggle.setAttribute('aria-pressed', String(isLight));
      toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    };
    sync();
    toggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('ebiz-theme', next); } catch (e) { /* storage unavailable */ }
      sync();
    });
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    const pre = $('.preloader');
    if (!pre) return;
    const hide = () => pre.classList.add('is-hidden');
    window.addEventListener('load', () => setTimeout(hide, 250));
    setTimeout(hide, 2500); // safety: never block the page for long
  }

  /* ---------- Header: scrolled state, progress bar, back-to-top ---------- */
  function initScrollUI() {
    const header = $('.site-header');
    const bar = $('.scroll-progress');
    const toTop = $('.back-to-top');
    const ring = toTop ? $('.ring circle', toTop) : null;
    const CIRC = 157;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(y / max, 1) : 0;
      if (header) header.classList.toggle('is-scrolled', y > 20);
      if (bar) bar.style.transform = `scaleX(${pct})`;
      if (toTop) toTop.classList.toggle('is-visible', y > 600);
      if (ring) ring.style.strokeDashoffset = String(CIRC - CIRC * pct);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();

    if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    const btn = $('.menu-toggle');
    const menu = $('#mobile-menu');
    if (!btn || !menu) return;
    const body = document.body;

    const setOpen = (open) => {
      body.classList.toggle('menu-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.setAttribute('aria-hidden', String(!open));
      menu.toggleAttribute('inert', !open);
      if (open) setTimeout(() => { const first = $('a', menu); if (first) first.focus(); }, 300);
    };
    setOpen(false);
    btn.addEventListener('click', () => setOpen(!body.classList.contains('menu-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', () => { if (window.innerWidth > 1080) setOpen(false); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Animated counters ---------- */
  function initCounters() {
    const counters = $$('[data-count]');
    if (!counters.length) return;
    const format = (n, decimals) => n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split('.')[1] || '').length;
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      if (prefersReducedMotion) { el.textContent = prefix + format(target, decimals) + suffix; return; }
      const duration = 2000;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
        el.textContent = prefix + format(target * eased, decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    counters.forEach((el) => io.observe(el));
  }

  /* ---------- Typed text rotator (hero) ---------- */
  function initTyped() {
    const el = $('[data-typed]');
    if (!el) return;
    const words = el.dataset.typed.split('|');
    if (prefersReducedMotion) { el.textContent = words[0]; return; }
    let w = 0, i = words[0].length, deleting = true;
    el.textContent = words[0];
    const step = () => {
      const word = words[w];
      if (deleting) {
        i--;
        el.textContent = word.slice(0, i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; }
        setTimeout(step, 45);
      } else {
        const next = words[w];
        i++;
        el.textContent = next.slice(0, i);
        if (i === next.length) { deleting = true; setTimeout(step, 2200); return; }
        setTimeout(step, 85);
      }
    };
    setTimeout(step, 2600);
  }

  /* ---------- Hero particle network (canvas) ---------- */
  function initParticles() {
    const canvas = $('#particles');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, points = [], raf, visible = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(Math.floor((w * h) / 16000), 80);
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, r: Math.random() * 1.6 + 0.6,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const light = document.documentElement.getAttribute('data-theme') === 'light';
      const rgb = light ? '8,145,178' : '34,211,238';
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb},0.7)`; ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j];
          const dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
          if (d < 14000) {
            ctx.strokeStyle = `rgba(${rgb},${0.18 * (1 - d / 14000)})`;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        const mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
        if (md < 26000) {
          ctx.strokeStyle = `rgba(${rgb},${0.35 * (1 - md / 26000)})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      if (visible) raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); if (visible) draw(); });
    const host = canvas.parentElement.parentElement;
    host.addEventListener('mousemove', (e) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    host.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
    // Pause when hero is off-screen to save battery
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) draw();
      }).observe(canvas);
    }
  }

  /* ---------- Cursor spotlight + subtle tilt on cards ---------- */
  function initSpotlight() {
    if (window.matchMedia('(hover: none)').matches) return;
    $$('.spotlight').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    });
    if (prefersReducedMotion) return;
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- Testimonials carousel ---------- */
  function initCarousel() {
    $$('[data-carousel]').forEach((root) => {
      const track = $('.carousel-track', root);
      const slides = $$('.testimonial', root);
      const dotsWrap = $('.carousel-dots', root);
      const prev = $('[data-prev]', root);
      const next = $('[data-next]', root);
      if (!track || slides.length < 2) return;
      let index = 0, timer;

      slides.forEach((s, i) => {
        s.setAttribute('role', 'group');
        s.setAttribute('aria-roledescription', 'slide');
        s.setAttribute('aria-label', `${i + 1} of ${slides.length}`);
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
        dot.addEventListener('click', () => { go(i); restart(); });
        dotsWrap.appendChild(dot);
      });
      const dots = $$('button', dotsWrap);

      const go = (i) => {
        index = (i + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((d, k) => d.setAttribute('aria-selected', String(k === index)));
        slides.forEach((s, k) => { s.setAttribute('aria-hidden', String(k !== index)); s.toggleAttribute('inert', k !== index); });
      };
      const restart = () => {
        clearInterval(timer);
        if (!prefersReducedMotion) timer = setInterval(() => go(index + 1), 6500);
      };
      prev && prev.addEventListener('click', () => { go(index - 1); restart(); });
      next && next.addEventListener('click', () => { go(index + 1); restart(); });
      root.addEventListener('mouseenter', () => clearInterval(timer));
      root.addEventListener('mouseleave', restart);
      root.addEventListener('focusin', () => clearInterval(timer));
      root.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
        if (e.key === 'ArrowRight') { go(index + 1); restart(); }
      });
      // Touch swipe
      let startX = null;
      track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', (e) => {
        if (startX === null) return;
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) { go(index + (dx < 0 ? 1 : -1)); restart(); }
        startX = null;
      });
      go(0); restart();
    });
  }

  /* ---------- Tabs (Solutions page) ---------- */
  function initTabs() {
    $$('[data-tabs]').forEach((root) => {
      const tabs = $$('[role="tab"]', root);
      const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
      const select = (i, focus) => {
        tabs.forEach((t, k) => {
          const on = k === i;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          if (panels[k]) panels[k].hidden = !on;
        });
        if (focus) tabs[i].focus();
        // Newly shown panels may contain reveal items
        $$('[data-reveal]', panels[i]).forEach((el) => el.classList.add('is-visible'));
      };
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => select(i));
        t.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowRight') select((i + 1) % tabs.length, true);
          if (e.key === 'ArrowLeft') select((i - 1 + tabs.length) % tabs.length, true);
        });
      });
      // Allow deep linking: solutions.html#finance opens that tab
      const hashIdx = panels.findIndex((p) => p && `#${p.id}` === location.hash);
      select(hashIdx >= 0 ? hashIdx : 0);
    });
  }

  /* ---------- Accordions ---------- */
  function initAccordions() {
    $$('[data-accordion]').forEach((root) => {
      const single = root.dataset.accordion === 'single';
      $$('.acc-item', root).forEach((item) => {
        const btn = $('.acc-trigger', item);
        const panel = $('.acc-panel', item);
        btn.setAttribute('aria-expanded', String(item.classList.contains('is-open')));
        panel.setAttribute('aria-hidden', String(!item.classList.contains('is-open')));
        btn.addEventListener('click', () => {
          const open = !item.classList.contains('is-open');
          if (single) $$('.acc-item.is-open', root).forEach((o) => {
            if (o !== item) { o.classList.remove('is-open'); $('.acc-trigger', o).setAttribute('aria-expanded', 'false'); $('.acc-panel', o).setAttribute('aria-hidden', 'true'); }
          });
          item.classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', String(open));
          panel.setAttribute('aria-hidden', String(!open));
        });
      });
    });
  }

  /* ---------- Services page: highlight current section in jump nav ---------- */
  function initScrollSpy() {
    const nav = $('.service-jump');
    if (!nav || !('IntersectionObserver' in window)) return;
    const links = $$('a', nav);
    const map = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove('is-active'));
          const a = map.get(e.target.id);
          if (a) { a.classList.add('is-active'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Timeline progress line (About page) ---------- */
  function initTimeline() {
    const tl = $('.timeline');
    const bar = $('.timeline-progress');
    if (!tl || !bar) return;
    const update = () => {
      const r = tl.getBoundingClientRect();
      const vh = window.innerHeight;
      const pct = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
      bar.style.height = `${pct * 100}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ---------- Contact form: validation + Formspree submit ---------- */
  function initContactForm() {
    const form = $('#contact-form');
    if (!form) return;
    const success = $('.form-success');
    const submitBtn = $('button[type="submit"]', form);

    // Pre-select a service when arriving from e.g. contact.html?service=cyber-security
    const params = new URLSearchParams(location.search);
    const svc = params.get('service');
    const select = $('#service', form);
    if (svc && select) {
      const opt = $$('option', select).find((o) => o.value === svc);
      if (opt) select.value = svc;
    }

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Please enter a valid email address.',
      phone: (v) => !v.trim() || /^[+\d][\d\s()-]{6,}$/.test(v.trim()) || 'Please enter a valid phone number.',
      service: (v) => !!v || 'Please choose a service.',
      message: (v) => v.trim().length >= 10 || 'Please tell us a little more (at least 10 characters).',
    };
    const check = (input) => {
      const rule = validators[input.name];
      if (!rule) return true;
      const field = input.closest('.field');
      const result = rule(input.value);
      const ok = result === true;
      field.classList.toggle('has-error', !ok);
      field.classList.toggle('is-valid', ok && input.value.trim() !== '');
      input.setAttribute('aria-invalid', String(!ok));
      const msg = $('.error-msg', field);
      if (msg) msg.textContent = ok ? '' : result;
      return ok;
    };
    $$('.input', form).forEach((input) => {
      input.addEventListener('blur', () => check(input));
      input.addEventListener('input', () => { if (input.closest('.field').classList.contains('has-error')) check(input); });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = $$('.input', form);
      const results = inputs.map(check);
      const consent = $('#consent', form);
      if (results.includes(false)) {
        const firstBad = inputs[results.indexOf(false)];
        firstBad.focus();
        return;
      }
      if (consent && !consent.checked) { consent.focus(); showToast('Please accept the privacy policy to continue.', 'alert-circle'); return; }
      if ($('[name="_gotcha"]', form).value) return; // bot caught by honeypot

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      const notConfigured = form.action.includes('YOUR_FORM_ID');
      try {
        if (notConfigured) {
          // Demo mode: no Formspree ID yet. Simulate a successful send.
          await new Promise((r) => setTimeout(r, 1200));
          console.info('[E-BIZ] Contact form is in demo mode. Add your Formspree form ID in contact.html to receive real emails.');
        } else {
          const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
          if (!res.ok) throw new Error('Network response was not ok');
        }
        form.hidden = true;
        success.classList.add('is-visible');
        success.focus();
        initIcons();
      } catch (err) {
        showToast('Sorry, something went wrong. Please email us directly.', 'alert-triangle');
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });

    const reset = $('[data-form-reset]');
    if (reset) reset.addEventListener('click', () => {
      form.reset(); form.hidden = false; success.classList.remove('is-visible');
      $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'has-error'));
      $('#name', form).focus();
    });
  }

  /* ---------- Newsletter (footer) ---------- */
  function initNewsletter() {
    $$('.newsletter').forEach((f) => {
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = $('input[type="email"]', f);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) { input.focus(); showToast('Please enter a valid email address.', 'alert-circle'); return; }
        f.reset();
        showToast('Thanks for subscribing! Watch your inbox for insights.', 'check-circle-2');
      });
    });
  }

  /* ---------- Business hours: highlight today + open/closed badge ---------- */
  function initHours() {
    const table = $('.hours');
    if (!table) return;
    // Hours are evaluated in the company's timezone (configure in data attribute)
    const tz = table.dataset.timezone || 'Asia/Colombo';
    let now;
    try { now = new Date(new Date().toLocaleString('en-US', { timeZone: tz })); } catch (e) { now = new Date(); }
    const day = now.getDay(); // 0 = Sunday
    const row = $(`tr[data-day~="${day}"]`, table);
    if (row) row.classList.add('is-today');
    const status = $('.open-status');
    if (!status || !row) return;
    const [open, close] = (row.dataset.hours || '').split('-').map(Number);
    const h = now.getHours() + now.getMinutes() / 60;
    const isOpen = !isNaN(open) && h >= open && h < close;
    status.classList.add(isOpen ? 'open' : 'closed');
    status.textContent = isOpen ? 'Open now' : 'Closed now — we reply next business day';
  }

  /* ---------- Toast helper ---------- */
  let toastTimer;
  function showToast(message, icon = 'check-circle-2') {
    let toast = $('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast glass';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i data-lucide="${icon}"></i><span></span>`;
    $('span', toast).textContent = message;
    initIcons();
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4000);
  }

  /* ---------- Graceful fallback for remote images ---------- */
  function initImageFallback() {
    const fallback = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0f1f38"/><stop offset=".6" stop-color="#312e81"/><stop offset="1" stop-color="#0e7490"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><g fill="none" stroke="#22d3ee" stroke-opacity=".25"><circle cx="400" cy="300" r="90"/><circle cx="400" cy="300" r="160"/><circle cx="400" cy="300" r="240"/></g></svg>'
    );
    const apply = (img) => { if (!img.dataset.fallback) { img.dataset.fallback = '1'; img.classList.add('img-fallback'); img.src = fallback; } };
    $$('img').forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.src) apply(img);
      img.addEventListener('error', () => apply(img));
    });
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ---------- Service worker (offline support on GitHub Pages) ---------- */
  function initServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initIcons();
    initImageFallback();
    initTheme();
    initPreloader();
    initScrollUI();
    initMobileMenu();
    initReveal();
    initCounters();
    initTyped();
    initParticles();
    initSpotlight();
    initCarousel();
    initTabs();
    initAccordions();
    initScrollSpy();
    initTimeline();
    initContactForm();
    initNewsletter();
    initHours();
    initYear();
    initServiceWorker();
  });
})();
