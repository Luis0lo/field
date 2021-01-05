const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const Field = require('./models/field');
const { join } = require('path');

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

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/fields',
  catchAsync(async (req, res) => {
    const fields = await Field.find({});
    res.render('fields/index', { fields });
  })
);

app.get('/fields/new', (req, res) => {
  res.render('fields/new');
});

app.post(
  '/fields',
  catchAsync(async (req, res, next) => {
    // if (!req.body.field) throw new ExpressError('Invalid Field Data', 400);
    const fieldSchema = Joi.object({
      field: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
      }).required(),
    });
    const { error } = fieldSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    console.log(result);
    const field = new Field(req.body.field);
    await field.save();
    res.redirect(`/fields/${field._id}`);
  })
);

app.get(
  '/fields/:id',
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id);
    res.render('fields/show', { field });
  })
);

app.get(
  '/fields/:id/edit',
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id);
    res.render('fields/edit', { field });
  })
);

app.put(
  '/fields/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const field = await Field.findByIdAndUpdate(id, { ...req.body.field });
    res.redirect(`/fields/${field._id}`);
  })
);

app.delete(
  '/fields/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Field.findByIdAndDelete(id);
    res.redirect('/fields');
  })
);

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
