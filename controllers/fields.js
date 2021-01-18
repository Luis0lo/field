const Field = require('../models/field');

module.exports.index = async (req, res) => {
  const fields = await Field.find({});
  res.render('fields/index', { fields });
};

module.exports.renderNewForm = (req, res) => {
  res.render('fields/new');
};

module.exports.createField = async (req, res, next) => {
  const field = new Field(req.body.field);
  field.owner = req.user._id;
  await field.save();
  req.flash('success', 'Your field has been posted');
  res.redirect(`/fields/${field._id}`);
};

module.exports.showField = async (req, res) => {
  const field = await Field.findById(req.params.id)
    .populate({ path: 'reviews', populate: { path: 'owner' } })
    .populate('owner');
  if (!field) {
    req.flash('error', 'Cannot find that field!');
    return res.redirect('/fields');
  }
  res.render('fields/show', { field });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const field = await Field.findById(id);
  if (!field) {
    req.flash('error', 'Cannot find that field!');
    return res.redirect('/fields');
  }
  res.render('fields/edit', { field });
};

module.exports.updateFields = async (req, res) => {
  const { id } = req.params;
  const field = await Field.findByIdAndUpdate(id, { ...req.body.field });
  req.flash('success', 'Your field has been Updated');
  res.redirect(`/fields/${field._id}`);
};

module.exports.deleteField = async (req, res) => {
  const { id } = req.params;
  await Field.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted field');
  res.redirect('/fields');
};