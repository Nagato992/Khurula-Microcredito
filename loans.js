const router = require('express').Router();
const db = require('./db');
const { exigirLogin, exigirAdmin } = require('./auth');

const r2 = (n) => Math.round(n * 100) / 100;

// Juros simples fixos: total = valor * (1 + taxa * meses)
function calcular(valor, taxaMensal, meses) {
  const total = r2(valor * (1 + taxaMensal * meses));
  return { total, prestacao: r2(total / meses) };
}

function comSaldo(l) {
  const pago = db.prepare('SELECT COALESCE(SUM(valor),0) s FROM payments WHERE loan_id = ?').get(l.id).s;
  return { ...l, pago: r2(pago), saldo: r2(l.total - pago) };
}

router.use(exigirLogin);

// Simulação (não grava nada)
router.get('/simular', (req, res) => {
  const valor = Number(req.query.valor), meses = Number(req.query.meses);
  if (!(valor > 0) || !(meses >= 1))
    return res.status(400).json({ erro: 'Indique valor e meses válidos.' });
  const taxa = Number(process.env.TAXA_MENSAL || 0.1);
  res.json({ valor, meses, taxa_mensal: taxa, ...calcular(valor, taxa, meses) });
});

// Pedir crédito
router.post('/', (req, res) => {
  const valor = Number(req.body.valor), meses = parseInt(req.body.meses, 10);
  const max = Number(process.env.VALOR_MAXIMO || 20000);
  if (!(valor > 0) || valor > max) return res.status(400).json({ erro: `Valor deve estar entre 1 e ${max}.` });
  if (!(meses >= 1 && meses <= 12)) return res.status(400).json({ erro: 'Prazo deve ser de 1 a 12 meses.' });
  // Nome e BI só são pedidos aqui, na primeira solicitação de crédito
  const cli = db.prepare('SELECT nome, bi FROM users WHERE id = ?').get(req.user.id);
  const nome = (req.body.nome || cli.nome || '').trim(), bi = (req.body.bi || cli.bi || '').trim();
  if (nome.length < 3) return res.status(400).json({ erro: 'Indique o seu nome completo.' });
  if (bi.length < 8) return res.status(400).json({ erro: 'Indique o número do seu BI.' });
  const ativo = db.prepare("SELECT 1 FROM loans WHERE user_id = ? AND estado IN ('pendente','aprovado')").get(req.user.id);
  if (ativo) return res.status(409).json({ erro: 'Já tem um crédito pendente ou em curso.' });
  db.prepare('UPDATE users SET nome = ?, bi = ? WHERE id = ?').run(nome, bi, req.user.id);
  const taxa = Number(process.env.TAXA_MENSAL || 0.1);
  const { total, prestacao } = calcular(valor, taxa, meses);
  const r = db.prepare('INSERT INTO loans (user_id, valor, taxa_mensal, meses, total, prestacao) VALUES (?,?,?,?,?,?)')
    .run(req.user.id, valor, taxa, meses, total, prestacao);
  res.status(201).json(comSaldo(db.prepare('SELECT * FROM loans WHERE id = ?').get(r.lastInsertRowid)));
});

// Listar (cliente: os seus; admin: todos)
router.get('/', (req, res) => {
  const rows = req.user.role === 'admin'
    ? db.prepare('SELECT l.*, u.nome, u.telefone, u.bi FROM loans l JOIN users u ON u.id = l.user_id ORDER BY l.id DESC').all()
    : db.prepare('SELECT * FROM loans WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
  res.json(rows.map(comSaldo));
});

function carregar(req, res) {
  const l = db.prepare('SELECT * FROM loans WHERE id = ?').get(req.params.id);
  if (!l || (req.user.role !== 'admin' && l.user_id !== req.user.id)) {
    res.status(404).json({ erro: 'Crédito não encontrado.' }); return null;
  }
  return l;
}

// Detalhe com pagamentos
router.get('/:id', (req, res) => {
  const l = carregar(req, res); if (!l) return;
  const pagamentos = db.prepare('SELECT * FROM payments WHERE loan_id = ? ORDER BY id').all(l.id);
  res.json({ ...comSaldo(l), pagamentos });
});

// Admin: aprovar / rejeitar
router.patch('/:id/decidir', exigirAdmin, (req, res) => {
  const l = carregar(req, res); if (!l) return;
  if (l.estado !== 'pendente') return res.status(409).json({ erro: 'Este pedido já foi decidido.' });
  const { decisao } = req.body;
  if (decisao === 'aprovar')
    db.prepare("UPDATE loans SET estado='aprovado', aprovado_em=CURRENT_TIMESTAMP WHERE id=?").run(l.id);
  else if (decisao === 'rejeitar')
    db.prepare("UPDATE loans SET estado='rejeitado' WHERE id=?").run(l.id);
  else return res.status(400).json({ erro: "Decisão deve ser 'aprovar' ou 'rejeitar'." });
  res.json(comSaldo(db.prepare('SELECT * FROM loans WHERE id = ?').get(l.id)));
});

// Admin: registar pagamento
router.post('/:id/pagamentos', exigirAdmin, (req, res) => {
  const l = carregar(req, res); if (!l) return;
  if (l.estado !== 'aprovado') return res.status(409).json({ erro: 'Só créditos aprovados recebem pagamentos.' });
  const valor = Number(req.body.valor);
  const { saldo } = comSaldo(l);
  if (!(valor > 0) || valor > saldo) return res.status(400).json({ erro: `Valor inválido. Saldo em dívida: ${saldo}.` });
  db.prepare('INSERT INTO payments (loan_id, valor) VALUES (?,?)').run(l.id, valor);
  if (r2(saldo - valor) <= 0) db.prepare("UPDATE loans SET estado='pago' WHERE id=?").run(l.id);
  res.status(201).json(comSaldo(db.prepare('SELECT * FROM loans WHERE id = ?').get(l.id)));
});

module.exports = router;
