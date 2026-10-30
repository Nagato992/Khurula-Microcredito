require('dotenv').config();
if (!process.env.JWT_SECRET) { console.error('Defina JWT_SECRET nas variáveis de ambiente'); process.exit(1); }
const express = require('express');
const path = require('path');
require('./db');
const { router: auth } = require('./auth');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.use('/api/auth', auth);
app.use('/api/loans', require('./loans'));

const port = process.env.PORT || 3000;
if (require.main === module) app.listen(port, () => console.log(`http://localhost:${port}`));
module.exports = app;
