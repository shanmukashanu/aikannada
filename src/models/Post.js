const mongoose = require('mongoose');
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    category: {
      type: String,
      enum: ['ai_news', 'ai_technology', 'blog', 'ai_startup', 'article', 'karnataka_tech'],
      required: true,
      index: true,
    },
    excerpt: { type: String },
    content: { type: String },
    imageUrl: { type: String },
    imagePublicId: { type: String },
    // Optional video support
    videoUrl: { type: String },
    videoPublicId: { type: String },
    // Multiple media support
    media: [{
      url: String,
      type: { type: String, enum: ['image', 'video'], default: 'image' },
      publicId: String,
    }],
    tags: [{ type: String }],
    likes: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    author: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);
