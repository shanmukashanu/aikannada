const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    replied: { type: Boolean, default: false },
    repliedAt: { type: Date },
    lastReplySubject: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);
