const mongoose = require('mongoose');
const { fieldSchema } = require('../schemas');
const Review = require('./review');
const Schema = mongoose.Schema;

const FieldSchema = new Schema({
  title: String,
  image: String,
  price: Number,
  description: String,
  location: String,
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
