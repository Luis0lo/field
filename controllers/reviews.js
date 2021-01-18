const Field = require('../models/field');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const field = await Field.findById(req.params.id);
  const review = new Review(req.body.review);
  review.owner = req.user._id;
  field.reviews.push(review);
  await review.save();
  await field.save();
  req.flash('success', 'Thanks for your review!');
  res.redirect(`/fields/${field._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Field.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review');
  res.redirect(`/fields/${id}`);
};
