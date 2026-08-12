const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('is-open', !open);
});

nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('is-open');
}));

const phone = document.querySelector('#whatsapp');
phone?.addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
  let value = digits;
  if (digits.length > 2) value = `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length > 7) value = `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  event.target.value = value;
});

const form = document.querySelector('#lead-form');
const feedback = document.querySelector('#form-feedback');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const button = form.querySelector('button[type="submit"]');
  const data = new FormData(form);
  const payload = Object.fromEntries(data.entries());
  payload.horarios = data.getAll('horarios');
  payload.consentimento = data.get('consentimento') === 'on';
  button.disabled = true;
  button.textContent = 'Enviando…';
  feedback.textContent = '';
  feedback.className = 'form-feedback';

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message);
    form.reset();
    feedback.textContent = result.message;
    feedback.classList.add('success');
  } catch (error) {
    feedback.textContent = error.message || 'Não foi possível enviar. Tente novamente.';
    feedback.classList.add('error');
  } finally {
    button.disabled = false;
    button.textContent = 'Enviar meu contato';
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

