/* ═══════════════════════════════════════════════════════════
   KODEK MEDIA — INTERACTIONS & ANIMATIONS
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────
     NAVBAR — scroll glass effect
  ──────────────────────────────────────── */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 48) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // run once on load

  /* ────────────────────────────────────────
     MOBILE MENU
  ──────────────────────────────────────── */
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  menuToggle.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    menuToggle.classList.toggle('open', menuOpen);
  });

  // Close on any link click
  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
    });
  });

  // Close on scroll past hero
  window.addEventListener('scroll', () => {
    if (menuOpen && window.scrollY > 200) {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
    }
  }, { passive: true });

  /* ────────────────────────────────────────
     SMOOTH ACTIVE NAV LINKS
  ──────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.style.color = link.getAttribute('href') === `#${id}`
              ? 'rgba(255,255,255,0.95)'
              : '';
          });
        }
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach(s => sectionObserver.observe(s));

  /* ────────────────────────────────────────
     SCROLL-TRIGGERED ANIMATIONS (.animate-in)
  ──────────────────────────────────────── */
  const animateEls = document.querySelectorAll('.animate-in');

  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Keep observing result items for bar animation
          if (!entry.target.classList.contains('result-item')) {
            fadeObserver.unobserve(entry.target);
          }
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  animateEls.forEach(el => fadeObserver.observe(el));

  /* ────────────────────────────────────────
     COUNTER ANIMATION — results section
  ──────────────────────────────────────── */
  const counters = document.querySelectorAll('.counter');

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el, target, duration = 2000) {
    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = Math.round(eased * target);

      // Format with commas for large numbers
      el.textContent = current.toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.target, 10);
          animateCounter(entry.target, target, 1800);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => counterObserver.observe(el));

  /* ────────────────────────────────────────
     HERO COUNTERS — animate on load after delay
  ──────────────────────────────────────── */
  const heroCounters = document.querySelectorAll('.hero-counter');

  window.addEventListener('load', () => {
    setTimeout(() => {
      heroCounters.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target, 1600);
      });
    }, 900); // waits for fade-up animation to complete
  });

  /* ────────────────────────────────────────
     PARALLAX — hero glow follows scroll
  ──────────────────────────────────────── */
  const heroGlow = document.querySelector('.hero-glow');

  if (heroGlow) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      // Subtle upward drift as you scroll
      heroGlow.style.transform = `translateX(-50%) translateY(${y * 0.22}px)`;
    }, { passive: true });
  }

  /* ────────────────────────────────────────
     CARD TILT — subtle 3D mouse tracking
  ──────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('.service-card, .testimonial-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -4;   // degrees
      const tiltY  = dx *  4;

      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
  });

  /* ────────────────────────────────────────
     SMOOTH ANCHOR SCROLLING (extra safety)
  ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
          10
        ) || 76;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ────────────────────────────────────────
     SCROLL-HIDE scroll indicator
  ──────────────────────────────────────── */
  const scrollIndicator = document.querySelector('.scroll-indicator');
  if (scrollIndicator) {
    window.addEventListener('scroll', () => {
      scrollIndicator.style.opacity = window.scrollY > 80 ? '0' : '';
    }, { passive: true });
  }

})();
