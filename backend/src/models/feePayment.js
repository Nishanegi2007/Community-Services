const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true, index: true },
  academicYear: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
  amount: { type: Number, required: true, min: 0.01, max: 100000 },
  paidAt: { type: Date, required: true, default: Date.now },
  method: { type: String, enum: ['cash', 'upi', 'bank', 'other'], default: 'cash' },
  receiptNumber: { type: String, trim: true, maxlength: 80, default: '' },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

feePaymentSchema.index({ enrollment: 1, month: 1, paidAt: -1 });

module.exports = mongoose.model('FeePayment', feePaymentSchema);
