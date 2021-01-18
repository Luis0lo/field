const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Field = require('../models/field');
const { isLoggedIn, isOwner, validateField } = require('../middleware');

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
      .populate({ path: 'reviews', populate: { path: 'owner' } })
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
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    const field = await Field.findById(id);
    if (!field) {
      req.flash('error', 'Cannot find that field!');
      return res.redirect('/fields');
    }
    res.render('fields/edit', { field });
  })
);

router.put(
  '/:id',
  isLoggedIn,
  isOwner,
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
  isLoggedIn,
  isOwner,
  catchAsync(async (req, res) => {
    const { id } = req.params;
    await Field.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted field');
    res.redirect('/fields');
  })
);

module.exports = router;
