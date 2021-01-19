const mongoose = require('mongoose');
const { fieldSchema } = require('../schemas');
const Review = require('./review');
const Schema = mongoose.Schema;

const FieldSchema = new Schema({
  title: String,
  images: [{ url: String, filename: String }],
  price: Number,
  description: String,
  location: String,
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review',
    },
  ],
});

//mongoose middleware
FieldSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.remove({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model('Field', FieldSchema);
