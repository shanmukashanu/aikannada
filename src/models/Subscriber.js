const mongoose = require('mongoose');
const { Schema } = mongoose;

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String },
    confirmed: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Subscriber', SubscriberSchema);
