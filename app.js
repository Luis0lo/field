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

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/fields', async (req, res) => {
  const fields = await Field.find({});
  res.render('fields/index', { fields });
});

app.get('/fields/new', (req, res) => {
  res.render('fields/new');
});

app.post('/fields', async (req, res) => {
  const field = new Field(req.body.field);
  await field.save();
  res.redirect(`/fields/${field._id}`);
});

app.get('/fields/:id', async (req, res) => {
  const field = await Field.findById(req.params.id);
  res.render('fields/show', { field });
});

app.listen(3000, () => {
  console.log('Running in 3k');
});
