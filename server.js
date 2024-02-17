const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

app.use(require('cookie-parser')());

app.get('/', async function (req, res) {
  try {
    const allTranslations = JSON.parse((await fsp.readFile('translations.json')).toString());
    const translations = allTranslations[req.cookies.language || 'en'] || allTranslations['en'];
    const regex = /\${([^}]*)}/gm;
    let html = (await fsp.readFile('public/index.html')).toString().replace(/\r/g, '');

    let m;
    while ((m = regex.exec(html)) !== null) {
      html = html.replace(m[0], translations[m[1]]);
    }

    res.send(html);
  } catch (e) {
    console.error(e);
    if (fs.existsSync('public/index.html')) {
      const html = (await fsp.readFile('public/index.html')).toString();
      res.status(500).send(html);
    } else {
      res.sendStatus(500);
    }
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/language/cat', function (req, res) {
  res.cookie('language', 'cat');
  res.redirect('/');
});

app.get('/language/en', function (req, res) {
  res.cookie('language', 'en');
  res.redirect('/');
});

app.all('*', (req, res) => {
  res.status(404).send('<h1>Page not found</h1><small>Error 404</small>');
});

app.listen(6715);