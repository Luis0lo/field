const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Field = require('../models/field');
const { isLoggedIn, isOwner, validateField } = require('../middleware');

const fields = require('../controllers/fields');

router.get('/', catchAsync(fields.index));

router.get('/new', isLoggedIn, fields.renderNewForm);

router.post('/', isLoggedIn, validateField, catchAsync(fields.createField));

router.get('/:id', catchAsync(fields.showField));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(fields.renderEditForm));

router.put(
  '/:id',
  isLoggedIn,
  isOwner,
  validateField,
  catchAsync(fields.updateFields)
);

router.delete('/:id', isLoggedIn, isOwner, catchAsync(fields.deleteField));

module.exports = router;
