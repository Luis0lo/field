const express = require('express');
const router = express.Router({ mergeParams: true });
const Field = require('../models/field');
const Review = require('../models/review');
const { validateReview, isLoggedIn, isReviewOwner } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');

const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewOwner,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
