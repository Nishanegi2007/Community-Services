const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  phone: { type: String, trim: true, maxlength: 30, default: '' },
  subject: { type: String, trim: true, maxlength: 120, default: 'General enquiry' },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'in-progress', 'handled'], default: 'new' },
}, { timestamps: true });

module.exports = mongoose.model('Inquiry', inquirySchema);
