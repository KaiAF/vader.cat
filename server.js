const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');

app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async function (req, res) {
  try {
    const photos = await fsp.readdir('public/vader');
    const allTranslations = JSON.parse((await fsp.readFile('translations.json')).toString());
    const translations = allTranslations[req.cookies.language || 'en'] || allTranslations['en'];

    res.render('index', {
      lang: translations,
      photos: photos.map(id => `<img width="336" src="vader/${id}" alt="vader ${id}" />`).join('\n'),
    });
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});

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