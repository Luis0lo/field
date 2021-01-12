const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { fieldSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const Field = require('./models/field');
const Review = require('./models/review');
const { join } = require('path');

const fields = require('./routes/fields');

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

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

app.use('/fields', fields);

app.get('/', (req, res) => {
  res.render('home');
});

app.post(
  '/fields/:id/reviews',
  validateReview,
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id);
    const review = new Review(req.body.review);
    field.reviews.push(review);
    await review.save();
    await field.save();
    res.redirect(`/fields/${field._id}`);
  })
);

app.delete(
  '/fields/:id/reviews/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Field.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/fields/${id}`);
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
