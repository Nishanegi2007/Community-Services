const mongoose = require('mongoose');

const galleryPhotoSchema = new mongoose.Schema({
  title: { type: String, trim: true, maxlength: 120, default: '' },
  category: { type: String, trim: true, maxlength: 60, default: 'School Events' },
  imageUrl: { type: String, required: true },
  imageKitFileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('GalleryPhoto', galleryPhotoSchema);
