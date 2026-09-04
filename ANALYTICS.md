# Analytics e consentimento

## Estado atual
Google Analytics, Google Tag Manager (GTM) e Meta Pixel estão **preparados, mas não ativos**. `assets/analytics-config.js` mantém `enabled: false` e IDs vazios; nesta condição não há banner, cookies opcionais, scripts ou requisições para Google/Meta.

## Ativação futura
1. Atualize a Política de Privacidade com o provedor, finalidade, cookies, retenção, compartilhamento e eventual transferência internacional.
2. Defina `enabled: true` e preencha somente `gtmId` (preferível) ou `gaId`, e/ou `metaPixelId`, em `assets/analytics-config.js`. Em um futuro pipeline de build, os equivalentes são `PUBLIC_ANALYTICS_ENABLED`, `PUBLIC_GA_ID`, `PUBLIC_GTM_ID` e `PUBLIC_META_PIXEL_ID` (documentados em `.dev.vars.example`).
3. Publique. O banner aparecerá apenas quando houver um ID configurado. Google/GTM só iniciam após consentimento de **Analytics**; Meta só após **Marketing**.

## Eventos permitidos
`page_view`, `cta_click`, `whatsapp_click`, `contact_form_start`, `contact_form_submit`, `faq_open`, `navigation_click`. A camada bloqueia campos pessoais, de contato e dados do formulário. Não instrumentar campos individualmente nem criar eventos de saúde/diagnóstico.

## Consent Mode
`analytics.js` centraliza consentimento por categoria e é o ponto de integração para o Google Consent Mode caso GTM/GA seja ativado futuramente.
