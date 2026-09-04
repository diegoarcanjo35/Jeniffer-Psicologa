/*
 * Analytics remains disabled in production until this file is deliberately updated.
 * For a build pipeline, map these fields from PUBLIC_ANALYTICS_ENABLED, PUBLIC_GA_ID,
 * PUBLIC_GTM_ID and PUBLIC_META_PIXEL_ID. Cloudflare Pages static HTML does not expose
 * runtime environment variables to browser JavaScript, so this file is the safe source
 * of truth for the current deployment.
 */
window.JENIFFER_ANALYTICS_CONFIG = Object.freeze({
  enabled: false,
  gaId: '',
  gtmId: '',
  metaPixelId: '',
  consentVersion: 1
});
