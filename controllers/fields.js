const Field = require('../models/field');
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
  const fields = await Field.find({});
  res.render('fields/index', { fields });
};

module.exports.renderNewForm = (req, res) => {
  res.render('fields/new');
};

module.exports.createField = async (req, res, next) => {
  const field = new Field(req.body.field);
  field.images = req.files.map((f) => ({ url: f.path, filename: f.filename }));
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
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  field.images.push(...imgs);
  await field.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await field.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    console.log(field);
  }

  req.flash('success', 'Your field has been Updated');
  res.redirect(`/fields/${field._id}`);
};

module.exports.deleteField = async (req, res) => {
  const { id } = req.params;
  await Field.findByIdAndDelete(id);
  req.flash('success', 'Successfully deleted field');
  res.redirect('/fields');
};
