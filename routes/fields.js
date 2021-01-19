const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/catchAsync');
const Field = require('../models/field');
const { isLoggedIn, isOwner, validateField } = require('../middleware');
const fields = require('../controllers/fields');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router
  .route('/')
  .get(catchAsync(fields.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateField,
    catchAsync(fields.createField)
  );
router.get('/new', isLoggedIn, fields.renderNewForm);

router
  .route('/:id')
  .get(catchAsync(fields.showField))
  .put(isLoggedIn, isOwner, validateField, catchAsync(fields.updateFields))
  .delete(isLoggedIn, isOwner, catchAsync(fields.deleteField));

router.get('/:id/edit', isLoggedIn, isOwner, catchAsync(fields.renderEditForm));

module.exports = router;
