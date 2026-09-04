/* =========================================================
   Jeniffer Correia Psicologia — comportamento do site
   ========================================================= */
(function () {
  'use strict';

  function track(name, details) {
    if (window.JenifferAnalytics) window.JenifferAnalytics.track(name, details);
  }

  /* ---------- Cabeçalho: fundo sólido depois do primeiro scroll ---------- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var syncHeader = function () { header.classList.toggle('is-stuck', window.scrollY > 24); };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  var menuButton = document.querySelector('[data-menu-button]');
  var nav = document.querySelector('[data-nav]');
  var backgroundContent = document.querySelectorAll('main, .site-footer, .mobile-bar, .wa-float');
  var previouslyFocused = null;

  function setBackgroundInert(inert) {
    backgroundContent.forEach(function (element) {
      if ('inert' in element) element.inert = inert;
      else if (inert) element.setAttribute('aria-hidden', 'true');
      else element.removeAttribute('aria-hidden');
    });
  }

  function setMenu(open, returnFocus) {
    if (!menuButton || !nav) return;
    if (open) previouslyFocused = document.activeElement;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
    setBackgroundInert(open);
    if (open) {
      window.setTimeout(function () { var first = nav.querySelector('a'); if (first) first.focus(); }, 0);
    } else if (returnFocus !== false && previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus();
    }
  }

  if (menuButton && nav) {
    menuButton.setAttribute('aria-label', 'Abrir menu');
    menuButton.addEventListener('click', function () { setMenu(menuButton.getAttribute('aria-expanded') !== 'true'); });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        track('navigation_click', { location: 'mobile_navigation', destination: link.getAttribute('href') || '' });
        setMenu(false, false);
      });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
    var desktop = window.matchMedia('(min-width: 960px)');
    var onChange = function (event) { if (event.matches) setMenu(false, false); };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ---------- Eventos neutros ---------- */
  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var destination = href.indexOf('wa.me') !== -1 ? 'whatsapp' : href;
    if (href.indexOf('wa.me') !== -1) track('whatsapp_click', { location: link.dataset.analyticsLocation || 'site_link', destination: destination });
    else if (link.classList.contains('button') || link.classList.contains('text-link')) track('cta_click', { location: link.dataset.analyticsLocation || 'site_cta', destination: destination });
  });
  document.querySelectorAll('.faq-list details').forEach(function (detail) {
    detail.addEventListener('toggle', function () { if (detail.open) track('faq_open', { location: 'como_funciona_faq' }); });
  });

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
    var started = false;
    form.addEventListener('focusin', function () {
      if (!started) { started = true; track('contact_form_start', { location: 'contact_form' }); }
    });
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
      fetch('/api/leads', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (response) {
          return response.json().catch(function () { return {}; }).then(function (result) {
            if (!response.ok) throw new Error(result.message || 'Não foi possível enviar agora.');
            return result;
          });
        })
        .then(function (result) {
          form.reset(); started = false;
          feedback.textContent = result.message || 'Contato recebido.';
          feedback.classList.add('success');
          track('contact_form_submit', { location: 'contact_form', status: 'success' });
        })
        .catch(function (error) {
          feedback.textContent = error.message || 'Não foi possível enviar. Tente novamente.';
          feedback.classList.add('error');
          track('contact_form_submit', { location: 'contact_form', status: 'technical_error' });
        })
        .then(function () { button.disabled = false; button.textContent = 'Enviar meu contato'; });
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
