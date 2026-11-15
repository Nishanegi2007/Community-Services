const mongoose = require('mongoose');

const feeRateSchema = new mongoose.Schema({
  academicYear: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}$/ },
  monthlyRates: {
    nursery: { type: Number, required: true, min: 0, max: 100000 },
    lkgTo4: { type: Number, required: true, min: 0, max: 100000 },
    class5: { type: Number, required: true, min: 0, max: 100000 },
  },
}, { timestamps: true });

module.exports = mongoose.model('FeeRate', feeRateSchema);
