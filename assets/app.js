/* =========================================================
   Jeniffer Correia Psicologia — comportamento do site
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Cabeçalho: fundo sólido depois do primeiro scroll ---------- */
  var header = document.querySelector('[data-header]');

  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 24);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var menuButton = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-nav]');
  var backdrop = document.querySelector('[data-nav-backdrop]');

  function setMenu(open) {
    if (!menuButton || !nav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    if (backdrop) backdrop.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setMenu(false); });
    });

    if (backdrop) backdrop.addEventListener('click', function () { setMenu(false); });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });

    // Ao girar o aparelho ou passar para desktop, o menu volta ao estado neutro.
    var desktop = window.matchMedia('(min-width: 900px)');
    var onChange = function (event) { if (event.matches) setMenu(false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Máscara de WhatsApp ---------- */
  var phone = document.querySelector('#whatsapp');
  if (phone) {
    phone.addEventListener('input', function (event) {
      var digits = event.target.value.replace(/\D/g, '').slice(0, 11);
      var value = digits;
      if (digits.length > 2) value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
      if (digits.length > 6) {
        var split = digits.length > 10 ? 7 : 6;
        value = '(' + digits.slice(0, 2) + ') ' + digits.slice(2, split) + '-' + digits.slice(split);
      }
      event.target.value = value;
    });
  }

  /* ---------- Formulário de contato ---------- */
  var form = document.querySelector('#lead-form');
  var feedback = document.querySelector('#form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (!form.reportValidity()) {
        var invalid = form.querySelector(':invalid');
        if (invalid) invalid.focus();
        return;
      }

      var button = form.querySelector('button[type="submit"]');
      var data = new FormData(form);
      var payload = {};

      data.forEach(function (value, key) { payload[key] = value; });
      payload.horarios = data.getAll('horarios');
      payload.consentimento = data.get('consentimento') === 'on';

      button.disabled = true;
      button.textContent = 'Enviando…';
      feedback.textContent = '';
      feedback.className = 'form-feedback';

      fetch('/api/leads', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) {
          return response.json()
            .catch(function () { return {}; })
            .then(function (result) {
              if (!response.ok) throw new Error(result.message || 'Não foi possível enviar agora.');
              return result;
            });
        })
        .then(function (result) {
          form.reset();
          feedback.textContent = result.message || 'Contato recebido.';
          feedback.classList.add('success');
        })
        .catch(function (error) {
          feedback.textContent = error.message || 'Não foi possível enviar. Tente novamente.';
          feedback.classList.add('error');
        })
        .then(function () {
          button.disabled = false;
          button.textContent = 'Enviar meu contato';
        });
    });
  }

  /* ---------- Entrada suave das seções ---------- */
  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealables.forEach(function (element) { element.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealables.forEach(function (element) { observer.observe(element); });
}());
