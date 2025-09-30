const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    approved: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
