const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.all('*', (req, res) => {
  res.status(404).send('<h1>Page not found</h1><small>Error 404</small>');
});

app.listen(6715);