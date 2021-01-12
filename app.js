const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const { join } = require('path');

const fields = require('./routes/fields');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/field', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

// check if there is any error
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thisisasecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //1k milsecond in a sec > 60sec in a min > 60 min in a hr > 24hr in a day > 7 days ina week
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

app.use('/fields', fields);
app.use('/fields/:id/reviews', reviews);

app.get('/', (req, res) => {
  res.render('home');
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Something went wrong';
  res.status(statusCode).render('error', { err });
});

app.listen(3000, () => {
  console.log('Running in 3k');
});
