const menuButton = document.querySelector('.menu-button');
const menu = document.querySelector('#menu');

menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

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

const quotes = [...document.querySelectorAll('.quote-track blockquote')];
let currentQuote = 0;
document.querySelectorAll('[data-slide]').forEach((button) => button.addEventListener('click', () => {
  quotes[currentQuote].classList.remove('active');
  const direction = button.dataset.slide === 'next' ? 1 : -1;
  currentQuote = (currentQuote + direction + quotes.length) % quotes.length;
  quotes[currentQuote].classList.add('active');
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
