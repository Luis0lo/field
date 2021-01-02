const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Field = require('./models/field');

mongoose.connect('mongodb://localhost:27017/field', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

// check if there is any error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/reportfield', async (req, res) => {
  const camp = new Field({
    title: 'Coelho',
    description: 'Aguacate e Anonas',
  });
  await camp.save();
  res.send(camp);
});

app.listen(3000, () => {
  console.log('Running in 3k');
});
