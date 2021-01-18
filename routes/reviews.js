const express = require('express');
const router = express.Router({ mergeParams: true });
const Field = require('../models/field');
const Review = require('../models/review');
const { validateReview } = require('../middleware');
const catchAsync = require('../utilities/catchAsync');

router.post(
  '/',
  validateReview,
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id);
    const review = new Review(req.body.review);
    field.reviews.push(review);
    await review.save();
    await field.save();
    req.flash('success', 'Thanks for your review!');
    res.redirect(`/fields/${field._id}`);
  })
);

router.delete(
  '/:reviewId',
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Field.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review');
    res.redirect(`/fields/${id}`);
  })
);

module.exports = router;
