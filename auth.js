const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = require('express').Router();
const db = require('./db');

const assinar = (u) =>
  jwt.sign({ id: u.id, role: u.role, nome: u.nome || u.telefone }, process.env.JWT_SECRET, { expiresIn: '8h' });

function exigirLogin(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ erro: 'Sessão inválida. Faça login.' }); }
}
function exigirAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ erro: 'Apenas administradores.' });
  next();
}

// Aceita 841234567, 84 123 4567 ou +258841234567
function normalizar(t) {
  let d = String(t || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('258')) d = d.slice(3);
  return d;
}

router.post('/register', (req, res) => {
  const telefone = normalizar(req.body.telefone), { password } = req.body;
  if (telefone.length !== 9) return res.status(400).json({ erro: 'Indique um número de telefone válido (9 dígitos).' });
  if (!password || password.length < 6) return res.status(400).json({ erro: 'A palavra-passe deve ter pelo menos 6 caracteres.' });
  if (db.prepare('SELECT 1 FROM users WHERE telefone = ?').get(telefone))
    return res.status(409).json({ erro: 'Este número já está registado.' });
  const r = db.prepare('INSERT INTO users (telefone, password_hash) VALUES (?,?)')
    .run(telefone, bcrypt.hashSync(password, 10));
  const u = { id: r.lastInsertRowid, role: 'cliente', nome: telefone };
  res.status(201).json({ token: assinar(u), user: u });
});

router.post('/login', (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE telefone = ?').get(normalizar(req.body.telefone));
  if (!u || !bcrypt.compareSync(req.body.password || '', u.password_hash))
    return res.status(401).json({ erro: 'Telefone ou palavra-passe incorretos.' });
  res.json({ token: assinar(u), user: { id: u.id, role: u.role, nome: u.nome || u.telefone } });
});

// Dados já guardados do cliente (para não pedir BI duas vezes)
router.get('/me', exigirLogin, (req, res) => {
  const u = db.prepare('SELECT id, nome, telefone, bi, role FROM users WHERE id = ?').get(req.user.id);
  res.json(u);
});

module.exports = { router, exigirLogin, exigirAdmin };
