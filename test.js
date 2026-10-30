// Teste de ponta a ponta: npm run test
process.env.DB_FILE = ':memory:';
process.env.JWT_SECRET = 'teste'; process.env.ADMIN_TELEFONE = '840000000'; process.env.ADMIN_PASSWORD = 'admin1234';
const assert = require('assert');
const app = require('./server');
const srv = app.listen(0, async () => {
  const base = `http://localhost:${srv.address().port}/api`;
  const call = async (p, m = 'GET', b, t) => { const r = await fetch(base + p, { method: m, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: b && JSON.stringify(b) }); return { s: r.status, d: await r.json() }; };
  try {
    const reg = await call('/auth/register', 'POST', { telefone: '84 111 1111', password: 'segredo1' });
    assert.equal(reg.s, 201); const c = reg.d.token;
    const adm = (await call('/auth/login', 'POST', { telefone: '840000000', password: 'admin1234' })).d.token;
    const sim = await call('/loans/simular?valor=1000&meses=4', 'GET', null, c);
    assert.equal(sim.d.total, 1400); assert.equal(sim.d.prestacao, 350);
    assert.equal((await call('/loans', 'POST', { valor: 1000, meses: 4 }, c)).s, 400); // sem nome/BI
    const loan = await call('/loans', 'POST', { valor: 1000, meses: 4, nome: 'Ana Macie', bi: '110100123456B' }, c);
    assert.equal((await call('/auth/me', 'GET', null, c)).d.bi, '110100123456B');
    assert.equal(loan.s, 201); assert.equal(loan.d.estado, 'pendente');
    assert.equal((await call('/loans', 'POST', { valor: 500, meses: 2 }, c)).s, 409);
    assert.equal((await call(`/loans/${loan.d.id}/decidir`, 'PATCH', { decisao: 'aprovar' }, c)).s, 403);
    assert.equal((await call(`/loans/${loan.d.id}/decidir`, 'PATCH', { decisao: 'aprovar' }, adm)).d.estado, 'aprovado');
    assert.equal((await call(`/loans/${loan.d.id}/pagamentos`, 'POST', { valor: 400 }, adm)).d.saldo, 1000);
    const fim = await call(`/loans/${loan.d.id}/pagamentos`, 'POST', { valor: 1000 }, adm);
    assert.equal(fim.d.estado, 'pago'); assert.equal(fim.d.saldo, 0);
    console.log('Todos os testes passaram ✔');
  } catch (e) { console.error('FALHOU:', e.message); process.exitCode = 1; }
  srv.close();
});
