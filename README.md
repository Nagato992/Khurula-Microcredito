# Khurula Microcrédito

Khurula Microcrédito é uma app com: registo com telefone e palavra-passe (nome e BI só são pedidos ao solicitar crédito), pedido de crédito, simulação, aprovação pelo administrador e registo de pagamentos.

## Como correr (VS Code)
1. Instale o Node.js 18+ e abra esta pasta no VS Code (`File > Open Folder`).
2. Abra o terminal (`Ctrl + '`) e corra:
   ```bash
   npm install
   npm test        # verifica que tudo funciona
   npm run dev     # arranca em http://localhost:3000
   ```
3. Edite o `.env`: **troque o `JWT_SECRET` e a palavra-passe do admin**.
4. Abra http://localhost:3000. Entre como admin (telefone e palavra-passe do `.env`) para aprovar pedidos.

## API
| Método | Rota | Quem |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | público |
| GET | /api/loans/simular?valor=&meses= | login |
| POST | /api/loans | cliente |
| GET | /api/loans, /api/loans/:id | login |
| PATCH | /api/loans/:id/decidir `{decisao:"aprovar"\|"rejeitar"}` | admin |
| POST | /api/loans/:id/pagamentos `{valor}` | admin |

Pode testar a API com a extensão *Thunder Client*.

## Próximos passos
- Estado "em atraso" (data de vencimento por prestação)
- Integração M-Pesa / e-Mola / mKesh
- Migrar para PostgreSQL e publicar com HTTPS
- App móvel (React Native / Flutter) a consumir esta API
- Licenciamento junto do Banco de Moçambique antes de operar com dinheiro real
