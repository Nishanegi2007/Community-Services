const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  admissionNumber: { type: String, required: true, trim: true, uppercase: true, maxlength: 40, unique: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  guardianName: { type: String, trim: true, maxlength: 100, default: '' },
  guardianPhone: { type: String, required: true, trim: true, maxlength: 30 },
  email: { type: String, trim: true, lowercase: true, maxlength: 254, default: '' },
  status: { type: String, enum: ['active', 'withdrawn', 'graduated'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
