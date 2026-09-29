/* =============================================
   STACKLY — Luxury Watch Store
   Main JavaScript
   ============================================= */

'use strict';

/* ── Page Loader ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 700);
    }
  }, 2000);
});

/* ── Custom Cursor ── */
(function initCursor() {
  if (window.matchMedia('(hover: none)').matches) return;
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');
  if (!dot || !outline) return;

  let mx = -100, my = -100;
  let ox = -100, oy = -100;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  const raf = () => {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    outline.style.left = ox + 'px';
    outline.style.top = oy + 'px';
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);

  document.querySelectorAll('a, button, [role="button"], .collection-card, .product-card, .blog-card, .dashboard-card, .welcome-card, .wishlist-card').forEach(el => {
    el.addEventListener('mouseenter', () => outline.classList.add('hovering'));
    el.addEventListener('mouseleave', () => outline.classList.remove('hovering'));
  });
})();

/* ── Navbar Scroll State ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const THRESHOLD = 60;
  let ticking = false;

  const update = () => {
    navbar.classList.toggle('scrolled', window.scrollY > THRESHOLD);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  // Set active link
  const links = navbar.querySelectorAll('.nav-links a');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(a => {
    const href = a.getAttribute('href');
    if (href === current || href === './' + current) a.classList.add('active');
  });
})();

/* ── Hamburger / Mobile Nav ── */
(function initMobileNav() {
  const btn = document.getElementById('hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  if (!btn || !mobileNav) return;

  const focusableSelectors = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
  let isOpen = false;

  const open = () => {
    isOpen = true;
    btn.classList.add('active');
    mobileNav.classList.add('open');
    document.body.style.overflow = 'hidden';
    btn.setAttribute('aria-expanded', 'true');
    // Focus first focusable element
    const first = mobileNav.querySelector(focusableSelectors);
    if (first) setTimeout(() => first.focus(), 400);
  };

  const close = () => {
    isOpen = false;
    btn.classList.remove('active');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  };

  btn.addEventListener('click', () => isOpen ? close() : open());

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));

  // Close on outside click
  document.addEventListener('click', e => {
    if (isOpen && !mobileNav.contains(e.target) && !btn.contains(e.target)) close();
  });

  // Focus trap
  mobileNav.addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key !== 'Tab') return;
    const focusable = [...mobileNav.querySelectorAll(focusableSelectors)].filter(el => !el.disabled);
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });
})();

/* ── Three.js Watch Scene ── */
(function initWatchScene() {
  const canvas = document.getElementById('watch-canvas');
  if (!canvas) return;
  if (typeof THREE === 'undefined') return;

  const isMobile = () => window.innerWidth < 576;
  const isTablet = () => window.innerWidth < 992;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile(), alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
  renderer.shadowMap.enabled = !isMobile();
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x000000, 0);

  // Scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 5);

  // Size
  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);
  const mainLight = new THREE.DirectionalLight(0xffedcc, 2.5);
  mainLight.position.set(5, 3, 4);
  mainLight.castShadow = !isMobile();
  scene.add(mainLight);
  const fillLight = new THREE.PointLight(0xc9a84c, 1.5, 15);
  fillLight.position.set(-3, 1, 3);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0x4466ff, 0.6, 12);
  rimLight.position.set(2, -2, -3);
  scene.add(rimLight);

  // Watch geometry group
  const watchGroup = new THREE.Group();
  scene.add(watchGroup);

  // --- Build watch from primitives ---
  // Case
  const caseGeo = new THREE.CylinderGeometry(0.9, 0.88, 0.22, 64);
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.95, roughness: 0.15 });
  const watchCase = new THREE.Mesh(caseGeo, caseMat);
  watchCase.rotation.x = Math.PI / 2;
  watchGroup.add(watchCase);

  // Bezel ring
  const bezelGeo = new THREE.TorusGeometry(0.92, 0.06, 16, 64);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0xb8902a, metalness: 0.98, roughness: 0.08 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  watchGroup.add(bezel);

  // Dial face
  const dialGeo = new THREE.CircleGeometry(0.82, 64);
  const dialMat = new THREE.MeshStandardMaterial({ color: 0x080812, metalness: 0.1, roughness: 0.7 });
  const dial = new THREE.Mesh(dialGeo, dialMat);
  dial.position.z = 0.115;
  watchGroup.add(dial);

  // Sapphire crystal
  const crystalGeo = new THREE.CircleGeometry(0.84, 64);
  const crystalMat = new THREE.MeshStandardMaterial({ color: 0xaaccff, metalness: 0, roughness: 0, transparent: true, opacity: 0.08 });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  crystal.position.z = 0.12;
  watchGroup.add(crystal);

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const isMain = i % 3 === 0;
    const markerGeo = new THREE.BoxGeometry(isMain ? 0.05 : 0.03, isMain ? 0.15 : 0.1, 0.01);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xd4a843, metalness: 0.9, roughness: 0.1 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    const r = 0.64;
    marker.position.set(Math.sin(angle) * r, Math.cos(angle) * r, 0.13);
    marker.rotation.z = -angle;
    watchGroup.add(marker);
  }

  // Hands
  const handMat = new THREE.MeshStandardMaterial({ color: 0xf0e0c0, metalness: 0.8, roughness: 0.2 });
  const secHandMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.9, roughness: 0.1 });

  const hourGeo = new THREE.BoxGeometry(0.05, 0.38, 0.015);
  const hourHand = new THREE.Mesh(hourGeo, handMat);
  hourHand.position.set(0, 0.12, 0.135);
  watchGroup.add(hourHand);

  const minGeo = new THREE.BoxGeometry(0.035, 0.52, 0.015);
  const minHand = new THREE.Mesh(minGeo, handMat);
  minHand.position.set(0, 0.18, 0.14);
  watchGroup.add(minHand);

  const secGeo = new THREE.BoxGeometry(0.018, 0.62, 0.012);
  const secHand = new THREE.Mesh(secGeo, secHandMat);
  secHand.position.set(0, 0.2, 0.145);
  watchGroup.add(secHand);

  // Crown
  const crownGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16);
  const crown = new THREE.Mesh(crownGeo, caseMat);
  crown.rotation.z = Math.PI / 2;
  crown.position.set(0.96, 0, 0);
  watchGroup.add(crown);

  // Strap segments
  const strapMat = new THREE.MeshStandardMaterial({ color: 0x1a0f08, metalness: 0.05, roughness: 0.9 });
  const topStrapGeo = new THREE.BoxGeometry(0.55, 0.9, 0.1);
  const topStrap = new THREE.Mesh(topStrapGeo, strapMat);
  topStrap.position.set(0, -1.02, -0.02);
  topStrap.rotation.x = 0.15;
  watchGroup.add(topStrap);

  const botStrapGeo = new THREE.BoxGeometry(0.55, 0.75, 0.1);
  const botStrap = new THREE.Mesh(botStrapGeo, strapMat);
  botStrap.position.set(0, 1.0, -0.02);
  botStrap.rotation.x = -0.15;
  watchGroup.add(botStrap);

  // Initial rotation
  watchGroup.rotation.y = -0.3;
  watchGroup.rotation.x = 0.15;

  // Explode-then-assemble animation (skip if reduced motion)
  const parts = [watchCase, bezel, dial, crystal, hourHand, minHand, secHand, crown, topStrap, botStrap];
  const originalPositions = parts.map(p => p.position.clone());

  if (!reducedMotion) {
    // Explode positions
    const explodeVectors = [
      new THREE.Vector3(0, 0, 1.5),
      new THREE.Vector3(0, 0, 2),
      new THREE.Vector3(0, 0, 2.5),
      new THREE.Vector3(0, 0, 3),
      new THREE.Vector3(-0.5, 0.3, 2),
      new THREE.Vector3(0.5, 0.3, 2),
      new THREE.Vector3(0, 0.4, 2.3),
      new THREE.Vector3(1.5, 0, 1),
      new THREE.Vector3(0, -2.5, 0.5),
      new THREE.Vector3(0, 2.5, 0.5),
    ];
    parts.forEach((p, i) => {
      p.position.copy(explodeVectors[i]);
      p.visible = false;
    });

    let assembleStarted = false;
    setTimeout(() => {
      assembleStarted = true;
      parts.forEach((part, i) => {
        part.visible = true;
        // Simple tween using internal loop
        part._assembleTarget = originalPositions[i].clone();
        part._assembleDelay = i * 80;
        part._assembleStart = performance.now() + i * 80;
        part._assembleDuration = 900;
      });
    }, 500);
  }

  // Mouse/touch interaction
  let targetRotX = 0.15, targetRotY = -0.3;
  let currentRotX = 0.15, currentRotY = -0.3;
  let isDragging = false, lastX = 0, lastY = 0;

  if (!isTablet()) {
    // Mouse parallax (desktop only)
    document.addEventListener('mousemove', e => {
      if (isDragging) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY = -0.3 + nx * 0.4;
      targetRotX = 0.15 + ny * 0.2;
    });
  }

  // Touch/drag to rotate (all devices)
  canvas.addEventListener('touchstart', e => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - lastX;
    const dy = e.touches[0].clientY - lastY;
    targetRotY += dx * 0.01;
    targetRotX += dy * 0.005;
    lastX = e.touches[0].clientX;
    lastY = e.touches[0].clientY;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { isDragging = false; });

  canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; lastY = e.clientY; });
  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    targetRotY += (e.clientX - lastX) * 0.01;
    targetRotX += (e.clientY - lastY) * 0.005;
    lastX = e.clientX; lastY = e.clientY;
  });
  document.addEventListener('mouseup', () => { isDragging = false; });

  // Resize observer
  const ro = new ResizeObserver(() => { resize(); });
  ro.observe(canvas.parentElement || canvas);
  resize();

  // Orientation change
  window.addEventListener('orientationchange', () => { setTimeout(resize, 300); });

  // Animation loop
  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    const now = performance.now();

    // Assemble animation
    parts.forEach(part => {
      if (part._assembleTarget) {
        const t = Math.min(1, (now - part._assembleStart) / part._assembleDuration);
        if (t >= 0 && t <= 1) {
          const ease = 1 - Math.pow(1 - t, 3);
          part.position.lerpVectors(part.position, part._assembleTarget, ease * 0.1 + 0.003);
          if (t >= 1) delete part._assembleTarget;
        }
      }
    });

    // Smooth rotation
    currentRotX += (targetRotX - currentRotX) * 0.05;
    currentRotY += (targetRotY - currentRotY) * 0.05;
    watchGroup.rotation.x = currentRotX;
    watchGroup.rotation.y = currentRotY + (reducedMotion ? 0 : elapsed * 0.15);

    // Animate clock hands
    const now2 = new Date();
    const sec = now2.getSeconds() + now2.getMilliseconds() / 1000;
    const min = now2.getMinutes() + sec / 60;
    const hour = (now2.getHours() % 12) + min / 60;
    secHand.rotation.z = -(sec / 60) * Math.PI * 2;
    minHand.rotation.z = -(min / 60) * Math.PI * 2;
    hourHand.rotation.z = -(hour / 12) * Math.PI * 2;

    // Floating bob
    if (!reducedMotion) {
      watchGroup.position.y = Math.sin(elapsed * 0.7) * 0.04;
    }

    renderer.render(scene, camera);
  };
  animate();
})();

/* ── AOS Init ── */
(function initAOS() {
  if (typeof AOS === 'undefined') return;
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 50,
    disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });
})();

/* ── GSAP Scroll Animations ── */
(function initGSAP() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return;

  // Hero bg parallax
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  // Section reveal
  gsap.utils.toArray('[data-gsap="fade-up"]').forEach(el => {
    gsap.fromTo(el, { opacity: 0, y: 40 }, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    });
  });

  // Stagger cards
  gsap.utils.toArray('[data-gsap="stagger"]').forEach(container => {
    const children = container.children;
    gsap.fromTo(children, { opacity: 0, y: 30 }, {
      opacity: 1, y: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out',
      scrollTrigger: { trigger: container, start: 'top 80%', toggleActions: 'play none none none' }
    });
  });
})();

/* ── Cart State ── */
(function initCart() {
  let count = parseInt(localStorage.getItem('stackly-cart') || '0', 10);
  const cartBtns = document.querySelectorAll('.cart-count');
  const updateUI = () => cartBtns.forEach(b => b.dataset.count = count || '');

  updateUI();

  document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      count++;
      localStorage.setItem('stackly-cart', count);
      updateUI();
      showToast('Added to your selection ✓');
    });
  });
})();

/* ── Toast ── */
function showToast(msg, duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}
window.showToast = showToast;

/* ── Filter System (Shop) ── */
(function initFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('[data-category]');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'fadeUp 0.4s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

/* ── Newsletter Form ── */
(function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input) return;
      showToast('Thank you for subscribing!');
      input.value = '';
    });
  });
})();

/* ── Lenis Smooth Scroll (all pages) ── */
(function initLenis() {
  if (typeof Lenis === 'undefined') return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    document.documentElement.style.scrollBehavior = 'smooth';
    return;
  }

  const lenis = new Lenis({
    lerp: 0.07,             // Premium, buttery smooth motion
    smoothWheel: true,
    wheelMultiplier: 1.0,   // Natural scroll speed
    touchMultiplier: 1.2,   // Slightly faster for touch
    infinite: false,
  });

  // Expose globally so other scripts can use lenis.stop() / lenis.start()
  window._lenis = lenis;

  // Sync with GSAP ScrollTrigger if available
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // Pause smooth scroll when mobile nav is open (prevents conflict)
  document.addEventListener('mobile-nav-open',  () => lenis.stop());
  document.addEventListener('mobile-nav-close', () => lenis.start());
})();
