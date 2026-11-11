// Wakie Wakie's — thin entry point. Routes live in routes/, helpers in lib/.
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Admin first, so /admin always asks for the password before any static file is served.
app.use('/admin', require('./routes/admin'));
app.use('/api', require('./routes/api'));
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'], maxAge: '1h' }));
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Wakie Wakie's running on :${PORT}`));
