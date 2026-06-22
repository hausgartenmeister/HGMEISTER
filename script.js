// ===== Lumière interactions =====
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const navLinks = document.getElementById('navLinks');
  const navToggle = document.getElementById('navToggle');
  const navOverlay = document.getElementById('navOverlay');

  // Sticky nav style on scroll
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  const openMenu = () => {
    navLinks.classList.add('open');
    nav.classList.add('open-menu');
    navOverlay.classList.add('open');
    document.body.classList.add('menu-open');
    navToggle.setAttribute('aria-expanded', 'true');
  };
  const closeMenu = () => {
    navLinks.classList.remove('open');
    nav.classList.remove('open-menu');
    navOverlay.classList.remove('open');
    document.body.classList.remove('menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
  };
  const toggleMenu = () =>
    navLinks.classList.contains('open') ? closeMenu() : openMenu();

  navToggle.addEventListener('click', toggleMenu);
  navOverlay.addEventListener('click', closeMenu);
  navLinks.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', closeMenu)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });

  // Reveal on scroll
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.15 }
  );
  document.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 80}ms`;
    io.observe(el);
  });

  // Gallery lightbox
  const galleryItems = [...document.querySelectorAll('.gallery__item')];
  const lightbox = document.getElementById('lightbox');
  if (lightbox && galleryItems.length) {
    const lbImg = document.getElementById('lightboxImg');
    const lbCap = document.getElementById('lightboxCap');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');
    let current = 0;

    const show = i => {
      current = (i + galleryItems.length) % galleryItems.length;
      const img = galleryItems[current].querySelector('img');
      const tag = galleryItems[current].querySelector('.gallery__tag');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = tag ? tag.textContent : img.alt;
    };
    const openLightbox = i => {
      show(i);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('menu-open');
    };
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('menu-open');
    };

    galleryItems.forEach((item, i) =>
      item.addEventListener('click', () => openLightbox(i))
    );
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => show(current - 1));
    lbNext.addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // Min date = today
  const dateInput = document.getElementById('date');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  // Booking form (optional)
  const form = document.getElementById('bookingForm');
  const note = document.getElementById('formNote');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const service = document.getElementById('service').value;
      const date = document.getElementById('date').value;

      if (!name || !email || !service || !date) {
        note.style.color = '#b04a4a';
        note.textContent = 'Please complete all fields to request your appointment.';
        return;
      }
      note.style.color = '';
      note.textContent = `Thank you, ${name.split(' ')[0]}! Your ${service} request for ${date} has been received — we'll confirm by email shortly.`;
      form.reset();
    });
  }

  // Services menu — image follows the cursor
  const serviceMenu = document.getElementById('serviceMenu');
  const menuReveal = document.getElementById('menuReveal');
  if (serviceMenu && menuReveal && window.matchMedia('(min-width:681px)').matches) {
    const items = serviceMenu.querySelectorAll('.menu__item');
    // reveal is absolutely positioned within .container, so measure against it
    const stage = menuReveal.offsetParent || serviceMenu;
    let raf = null;
    let targetX = 0, targetY = 0, curX = 0, curY = 0;

    const animate = () => {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      menuReveal.style.left = `${curX}px`;
      menuReveal.style.top = `${curY}px`;
      raf = requestAnimationFrame(animate);
    };

    const onMove = e => {
      const rect = stage.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    };

    serviceMenu.addEventListener('mouseenter', e => {
      const rect = stage.getBoundingClientRect();
      curX = targetX = e.clientX - rect.left;
      curY = targetY = e.clientY - rect.top;
      menuReveal.classList.add('is-visible');
      if (!raf) raf = requestAnimationFrame(animate);
    });
    serviceMenu.addEventListener('mousemove', onMove);
    serviceMenu.addEventListener('mouseleave', () => {
      menuReveal.classList.remove('is-visible');
      if (raf) { cancelAnimationFrame(raf); raf = null; }
    });

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const img = item.getAttribute('data-img');
        if (img) menuReveal.style.backgroundImage = `url('${img}')`;
      });
    });
  }

  // Stats — count up when scrolled into view
  const statNums = document.querySelectorAll('.stat__num');
  if (statNums.length) {
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const runCount = el => {
      const target = parseFloat(el.dataset.target) || 0;
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const start = performance.now();
      const tick = now => {
        const p = Math.min((now - start) / duration, 1);
        const val = target * easeOut(p);
        el.textContent = val.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals) + suffix;
      };
      requestAnimationFrame(tick);
    };
    const statObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { runCount(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    statNums.forEach(el => statObs.observe(el));
  }

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();
});
