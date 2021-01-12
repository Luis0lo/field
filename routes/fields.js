const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const ExpressError = require('../utilities/ExpressError');
const Field = require('../models/field');
const { fieldSchema } = require('../schemas.js');

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

router.get('/new', (req, res) => {
  res.render('fields/new');
});

router.post(
  '/',
  validateField,
  catchAsync(async (req, res, next) => {
    // if (!req.body.field) throw new ExpressError('Invalid Field Data', 400);
    const field = new Field(req.body.field);
    await field.save();
    req.flash('success', 'Your field has been posted');
    res.redirect(`/fields/${field._id}`);
  })
);

router.get(
  '/:id',
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id).populate('reviews');
    res.render('fields/show', { field });
  })
);

router.get(
  '/:id/edit',
  catchAsync(async (req, res) => {
    const field = await Field.findById(req.params.id);
    res.render('fields/edit', { field });
  })
);

router.put(
  '/:id',
  validateField,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const field = await Field.findByIdAndUpdate(id, { ...req.body.field });
    req.flash('success', 'Your field has been Updated');
    res.redirect(`/fields/${field._id}`);
  })
);

router.delete(
  '/:id',
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Field.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted field');
    res.redirect('/fields');
  })
);

module.exports = router;
