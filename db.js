const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const db = new Database(process.env.DB_FILE || 'microcredito.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  telefone TEXT NOT NULL UNIQUE,
  bi TEXT,
  email TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente',
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS loans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  valor REAL NOT NULL,
  taxa_mensal REAL NOT NULL,
  meses INTEGER NOT NULL,
  total REAL NOT NULL,
  prestacao REAL NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pendente',
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  aprovado_em TEXT
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  loan_id INTEGER NOT NULL REFERENCES loans(id),
  valor REAL NOT NULL,
  data TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Cria o administrador na primeira execução
const tel = process.env.ADMIN_TELEFONE;
if (tel && !db.prepare('SELECT 1 FROM users WHERE telefone = ?').get(tel)) {
  db.prepare('INSERT INTO users (nome, telefone, password_hash, role) VALUES (?,?,?,?)')
    .run('Administrador', tel, bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin1234', 10), 'admin');
  console.log('Administrador criado:', tel);
}
module.exports = db;
