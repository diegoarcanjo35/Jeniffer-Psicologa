/*
 * Privacy-preserving analytics boundary. No provider script is requested unless
 * enabled + an ID are configured AND the visitor grants the matching category.
 * When enabling a provider, update /privacidade with provider, cookies, purpose,
 * retention, sharing and international-transfer details before deployment.
 */
(function () {
  'use strict';
  var config = window.JENIFFER_ANALYTICS_CONFIG || {};
  var storageKey = 'jeniffer-consent-v' + (config.consentVersion || 1);
  var providersStarted = { google: false, meta: false };
  var allowedEvents = ['page_view', 'cta_click', 'whatsapp_click', 'contact_form_start', 'contact_form_submit', 'faq_open', 'navigation_click'];

  function optionalConfigured() {
    return Boolean(config.enabled && (config.gaId || config.gtmId || config.metaPixelId));
  }
  function defaultConsent() { return { necessary: true, analytics: false, marketing: false, version: config.consentVersion || 1 }; }
  function readConsent() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      return saved && saved.version === (config.consentVersion || 1) ? Object.assign(defaultConsent(), saved) : defaultConsent();
    } catch (_) { return defaultConsent(); }
  }
  function saveConsent(value) {
    try { localStorage.setItem(storageKey, JSON.stringify(Object.assign(defaultConsent(), value))); } catch (_) {}
  }
  function injectScript(src) {
    if (document.querySelector('script[src="' + src + '"]')) return;
    var script = document.createElement('script');
    script.src = src; script.async = true; document.head.appendChild(script);
  }
  function startGoogle() {
    if (providersStarted.google) return;
    if (config.gtmId) {
      providersStarted.google = true;
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      injectScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmId));
      return;
    }
    if (!config.gaId) return;
    providersStarted.google = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.gaId, { send_page_view: false });
    injectScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.gaId));
  }
  function startMeta() {
    if (providersStarted.meta || !config.metaPixelId) return;
    providersStarted.meta = true;
    window.fbq = window.fbq || function () { (window.fbq.queue = window.fbq.queue || []).push(arguments); };
    window.fbq('init', config.metaPixelId);
    window.fbq('track', 'PageView');
    injectScript('https://connect.facebook.net/en_US/fbevents.js');
  }
  function applyConsent() {
    var consent = readConsent();
    if (!optionalConfigured()) return consent;
    if (consent.analytics) startGoogle();
    if (consent.marketing) startMeta();
    return consent;
  }
  function track(name, details) {
    if (allowedEvents.indexOf(name) === -1) return;
    var consent = applyConsent();
    var event = Object.assign({ event: name }, details || {});
    // Only generic metadata is accepted. Never send form values or health information.
    delete event.name; delete event.email; delete event.phone; delete event.whatsapp; delete event.message; delete event.motivo; delete event.experiencia; delete event.horarios;
    if (providersStarted.google) {
      if (config.gtmId) window.dataLayer.push(event);
      else if (window.gtag) window.gtag('event', name, { location: event.location, destination: event.destination, status: event.status });
    }
    if (providersStarted.meta && consent.marketing) window.fbq('trackCustom', name, { location: event.location || undefined, destination: event.destination || undefined, status: event.status || undefined });
  }
  function showBanner() {
    if (!optionalConfigured() || readConsent().choice) return;
    var banner = document.createElement('section');
    banner.className = 'consent-banner'; banner.setAttribute('role', 'dialog'); banner.setAttribute('aria-label', 'Preferências de privacidade');
    banner.innerHTML = '<p>Usamos tecnologias opcionais somente com sua permissão. Você pode aceitar, recusar ou configurar suas preferências.</p><div><button type="button" data-consent="reject">Recusar não essenciais</button><button type="button" data-consent="settings">Configurar preferências</button><button type="button" data-consent="accept">Aceitar todos</button></div>';
    document.body.appendChild(banner);
    banner.addEventListener('click', function (event) {
      var action = event.target && event.target.getAttribute('data-consent'); if (!action) return;
      if (action === 'settings') { banner.classList.toggle('is-settings'); return; }
      saveConsent(action === 'accept' ? { analytics: true, marketing: true, choice: action } : { analytics: false, marketing: false, choice: action });
      applyConsent(); banner.remove();
    });
  }
  window.JenifferAnalytics = { track: track, getConsent: readConsent, setConsent: function (value) { saveConsent(value); return applyConsent(); } };
  document.addEventListener('DOMContentLoaded', function () {
    applyConsent();
    track('page_view', { location: window.location.pathname });
    showBanner();
  });
}());
