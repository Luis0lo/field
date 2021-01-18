const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Field = require('../models/field');
const { fieldSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');

const validateField = (req, res, next) => {
  const { error } = fieldSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

router.get(
  '/',
  catchAsync(async (req, res) => {
    const fields = await Field.find({});
    res.render('fields/index', { fields });
  })
);

router.get('/new', isLoggedIn, (req, res) => {
  res.render('fields/new');
});

router.post(
  '/',
  isLoggedIn,
  validateField,
  catchAsync(async (req, res, next) => {
    const field = new Field(req.body.field);
    field.owner = req.user._id;
    await field.save();
    req.flash('success', 'Your field has been posted');
    res.redirect(`/fields/${field._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id)
      .populate('reviews')
      .populate('owner');
    if (!field) {
      req.flash('error', 'Cannot find that field!');
      return res.redirect('/fields');
    }
    res.render('fields/show', { field });
  })
);

router.get(
  '/:id/edit',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const field = await Field.findById(id);
    if (!field) {
      req.flash('error', 'Cannot find that field!');
      return res.redirect('/fields');
    }
    if (!field.owner.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/fields/${id}`);
    }
    res.render('fields/edit', { field });
  })
);

router.put(
  '/:id',
  isLoggedIn,
  validateField,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const field = await Field.findById(id);
    if (!field.owner.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to do that!');
      return res.redirect(`/fields/${id}`);
    }
    const fieldd = await Field.findByIdAndUpdate(id, { ...req.body.field });
    req.flash('success', 'Your field has been Updated');
    res.redirect(`/fields/${field._id}`);
  })
);

router.delete(
  '/:id',
  isLoggedIn,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Field.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted field');
    res.redirect('/fields');
  })
);

module.exports = router;
