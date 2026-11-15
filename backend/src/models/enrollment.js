const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  classLevel: { type: String, required: true, enum: ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
  monthlyFee: { type: Number, required: true, min: 0, max: 100000 },
  joinedAt: { type: Date, required: true },
  leftAt: { type: Date, default: null },
}, { timestamps: true });

enrollmentSchema.index({ student: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
