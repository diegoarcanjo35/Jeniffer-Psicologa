const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  },
});

const clean = (value, max) => String(value ?? '').trim().slice(0, max);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^(?=(?:\D*\d){10,13}\D*$)[\d\s()+-]+$/;

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, message: 'Serviço temporariamente indisponível.' }, 503);

  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return json({ ok: false, message: 'Formato inválido.' }, 415);

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, message: 'Dados inválidos.' }, 400);
  }

  // Campo invisível: bots costumam preenchê-lo.
  if (clean(data.website, 200)) return json({ ok: true, message: 'Contato recebido.' }, 202);

  const nome = clean(data.nome, 80);
  const whatsapp = clean(data.whatsapp, 24);
  const email = clean(data.email, 120).toLowerCase();
  const motivo = clean(data.motivo, 140);
  const experiencia = clean(data.experiencia, 40);
  const mensagem = clean(data.mensagem, 1000);
  const horarios = Array.isArray(data.horarios) ? data.horarios.map((item) => clean(item, 30)).slice(0, 4) : [];

  if (!nome || !phonePattern.test(whatsapp) || !emailPattern.test(email) || !motivo || !experiencia || data.consentimento !== true) {
    return json({ ok: false, message: 'Revise os campos obrigatórios e tente novamente.' }, 422);
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const salt = new Date().toISOString().slice(0, 10);
  const ipHash = await sha256(`${salt}:${ip}`);
  const userAgent = clean(request.headers.get('user-agent'), 300);

  try {
    await env.DB.prepare(`
      INSERT INTO leads (nome, whatsapp, email, motivo, experiencia, horarios, mensagem, consentimento, origem, ip_hash, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'site', ?, ?)
    `).bind(nome, whatsapp, email, motivo, experiencia, JSON.stringify(horarios), mensagem, ipHash, userAgent).run();
  } catch (error) {
    console.error('lead_insert_failed', error?.message || error);
    return json({ ok: false, message: 'Não foi possível enviar agora. Tente novamente em instantes.' }, 500);
  }

  return json({ ok: true, message: 'Contato recebido. Jeniffer retornará em até um dia útil.' }, 201);
}

export function onRequestGet() {
  return json({ ok: false, message: 'Método não permitido.' }, 405, { Allow: 'POST' });
}

