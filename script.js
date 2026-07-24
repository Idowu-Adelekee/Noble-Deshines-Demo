const naviCheckbox = document.querySelector('.navigation__checkbox');
const naviButton = document.querySelector('.navigation__button');
const menu = document.querySelector('#menu');

naviCheckbox?.addEventListener('change', () => {
  naviButton?.setAttribute('aria-expanded', String(naviCheckbox.checked));
});

menu?.querySelectorAll('.navigation__link').forEach((link) => link.addEventListener('click', () => {
  if (!naviCheckbox) return;
  naviCheckbox.checked = false;
  naviButton?.setAttribute('aria-expanded', 'false');
}));

// Sticky header: fixed at all times, gains a blurred backdrop once the hero
// has been scrolled past, and hides/reveals smoothly with scroll direction.
const siteHeader = document.querySelector('header.full-width');
const hero = document.querySelector('.hero');

if (siteHeader) {
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateHeader = () => {
    const scrollY = window.scrollY;
    const heroHeight = hero ? hero.offsetHeight : 0;
    const pastHero = scrollY > heroHeight * 0.85;

    siteHeader.classList.toggle('header--blurred', pastHero);

    const menuOpen = naviCheckbox?.checked;
    const scrollingDown = scrollY > lastScrollY;

    if (!menuOpen && pastHero && scrollingDown) {
      siteHeader.classList.add('header--hidden');
    } else {
      siteHeader.classList.remove('header--hidden');
    }

    lastScrollY = scrollY;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    },
    { passive: true },
  );

  updateHeader();
}

const counters = document.querySelectorAll('[data-count]');
const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const counter = entry.target;
    const target = Number(counter.dataset.count);
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - started) / 1100, 1);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    observer.unobserve(counter);
  });
}, { threshold: 0.5 });
counters.forEach((counter) => counterObserver.observe(counter));

const quoteTrack = document.querySelector('.quote-track');
const quotes = [...document.querySelectorAll('.quote-track blockquote')];
let currentQuote = 0;
const goToQuote = (index) => {
  currentQuote = (index + quotes.length) % quotes.length;
  if (quoteTrack) {
    quoteTrack.style.transform = `translateX(-${currentQuote * 100}%)`;
  }
  quotes.forEach((quote, i) => quote.classList.toggle('active', i === currentQuote));
};
document.querySelectorAll('[data-slide]').forEach((button) => button.addEventListener('click', () => {
  const direction = button.dataset.slide === 'next' ? 1 : -1;
  goToQuote(currentQuote + direction);
}));

document.querySelectorAll('.faq details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    document.querySelectorAll('.faq details').forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

document.querySelector('#contact-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const status = form.querySelector('.form-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const originalLabel = submitButton?.textContent;

  status.textContent = 'Sending your message…';
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
  }

  try {
    const response = await fetch(form.action, {
      method: form.method || 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    const result = await response.json();

    if (response.ok && result.success) {
      status.textContent = 'Thanks — your message has been sent.';
      form.reset();
    } else {
      status.textContent = 'Something went wrong. Please try again.';
    }
  } catch (error) {
    status.textContent = 'Something went wrong. Please try again.';
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalLabel;
    }
  }
});

// Simple, subtle scroll-reveal animation used across the whole site.
const revealSelectors = [
  '.section-title',
  '.benefits article',
  '.stats > div',
  '.logo-row',
  '.service',
  '.services-cta',
  '.project',
  '.compare > div',
  '.quote-viewport',
  '.slider-controls',
  '.plan-card',
  '.about-copy',
  '.team article',
  '.about-cta',
  '.faq-list',
  '.contact-grid > *',
];

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll(revealSelectors.join(','));

if (prefersReducedMotion) {
  revealTargets.forEach((el) => el.classList.add('in-view'));
} else {
  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(index % 4) * 80}ms`;
  });

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' },
  );
  revealTargets.forEach((el) => revealObserver.observe(el));
}
