const mongoose = require('mongoose');

const monthlyFeeRecordSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
  academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  amountDue: { type: Number, required: true, min: 0, max: 100000 },
  status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid', required: true },
  statusChangedAt: { type: Date, default: Date.now },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

monthlyFeeRecordSchema.index({ enrollment: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyFeeRecord', monthlyFeeRecordSchema);
