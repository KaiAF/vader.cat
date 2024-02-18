require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
require('./bot');

if (!fs.existsSync(process.env.PICS)) fs.mkdirSync(process.env.PICS, { recursive: true });

app.set('view engine', 'ejs');
app.use(require('cookie-parser')());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async function (req, res) {
  try {
    const photos = await fsp.readdir(process.env.PICS);
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

app.get('/vader/:fileName', async function (req, res) {
  try {
    if (!fs.existsSync(`${process.env.PICS}/${req.params.fileName}`)) return res.sendStatus(404);
    const image = await fsp.readFile(`${process.env.PICS}/${req.params.fileName}`);

    res.set('cache-control', 'public, max-age=604800');
    res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': image.length });
    res.end(image);
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

app.listen(process.env.PORT || 6715);