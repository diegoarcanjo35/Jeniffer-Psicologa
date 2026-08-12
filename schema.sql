CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  motivo TEXT NOT NULL,
  experiencia TEXT NOT NULL,
  horarios TEXT NOT NULL DEFAULT '[]',
  mensagem TEXT NOT NULL DEFAULT '',
  consentimento INTEGER NOT NULL DEFAULT 1,
  origem TEXT NOT NULL DEFAULT 'site',
  status TEXT NOT NULL DEFAULT 'novo',
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

