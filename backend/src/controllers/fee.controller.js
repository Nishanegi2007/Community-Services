const Student = require('../models/student');
const Enrollment = require('../models/enrollment');
const FeeRate = require('../models/feeRate');
const FeePayment = require('../models/feePayment');
const MonthlyFeeRecord = require('../models/monthlyFeeRecord');

const CLASS_LEVELS = ['Nursery', 'LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'];
const ADMISSION_PATTERN = /^[A-Z0-9][A-Z0-9/-]{0,39}$/;
const DEFAULT_MONTHLY_RATES = { nursery: 600, lkgTo4: 700, class5: 800 };

function validAcademicYear(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}$/.test(value)) return false;
  return Number(value.slice(5, 7)) === (Number(value.slice(0, 4)) + 1) % 100;
}

function validMonth(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function monthBelongsToYear(month, academicYear) {
  if (!validMonth(month) || !validAcademicYear(academicYear)) return false;
  const [year, monthNumber] = month.split('-').map(Number);
  const absoluteMonth = year * 12 + monthNumber - 1;
  const yearStart = Number(academicYear.slice(0, 4)) * 12 + 3; // Academic years begin in April.
  return absoluteMonth >= yearStart && absoluteMonth < yearStart + 12;
}

function academicYearStart(academicYear) {
  return new Date(Date.UTC(Number(academicYear.slice(0, 4)), 3, 1));
}

function defaultEnrollmentStart(academicYear) {
  const month = currentMonth();
  return monthBelongsToYear(month, academicYear) ? periodDates(month).start : academicYearStart(academicYear);
}

function normalizeClass(value) {
  const text = String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (['nur', 'nursery', 'pre nursery', 'pre-nursery'].includes(text)) return 'Nursery';
  if (text === 'lkg' || text === 'lower kg' || text === 'lower kindergarten') return 'LKG';
  if (text === 'ukg' || text === 'upper kg' || text === 'upper kindergarten') return 'UKG';
  const numberWords = { '1st': 1, first: 1, '2nd': 2, second: 2, '3rd': 3, third: 3, '4th': 4, fourth: 4, '5th': 5, fifth: 5 };
  const matched = text.match(/^(?:class\s*)?(\d|1st|first|2nd|second|3rd|third|4th|fourth|5th|fifth)$/);
  const grade = matched ? Number(matched[1]) || numberWords[matched[1]] : null;
  return grade >= 1 && grade <= 5 ? `Class ${grade}` : null;
}

function monthlyFeeFor(classLevel, rates) {
  if (classLevel === 'Nursery') return rates.nursery;
  if (classLevel === 'Class 5') return rates.class5;
  return rates.lkgTo4;
}

function normalizeStudentRow(row) {
  const admissionNumber = typeof row.admissionNumber === 'string' ? row.admissionNumber.trim().toUpperCase() : '';
  const name = typeof row.name === 'string' ? row.name.trim() : '';
  const classLevel = normalizeClass(row.classLevel || row.class || row.grade);
  const guardianName = typeof row.guardianName === 'string' ? row.guardianName.trim() : '';
  const guardianPhone = typeof row.guardianPhone === 'string' || typeof row.guardianPhone === 'number'
    ? String(row.guardianPhone).trim()
    : '';
  const joinedAt = row.joinedAt ? new Date(row.joinedAt) : null;
  const errors = [];
  if (!ADMISSION_PATTERN.test(admissionNumber)) errors.push('Admission number is missing or invalid.');
  if (!name || name.length > 100) errors.push('Student name is required (up to 100 characters).');
  if (!classLevel || !CLASS_LEVELS.includes(classLevel)) errors.push('Class must be Nursery, LKG, UKG, or Class 1 to Class 5.');
  if (!guardianPhone || guardianPhone.length > 30) errors.push('Guardian phone is required (up to 30 characters).');
  if (joinedAt && Number.isNaN(joinedAt.getTime())) errors.push('Joining date is invalid.');
  return {
    errors,
    student: { admissionNumber, name, guardianName, guardianPhone },
    classLevel,
    joinedAt,
  };
}

function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function periodDates(month) {
  const start = new Date(`${month}-01T00:00:00.000Z`);
  const next = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
  return { start, end: new Date(next.getTime() - 1) };
}

async function getRates(req, res) {
  const now = new Date();
  const startYear = now.getUTCMonth() >= 3 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;
  const academicYear = `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`;
  try {
    await FeeRate.updateOne(
      { academicYear },
      { $setOnInsert: { academicYear, monthlyRates: DEFAULT_MONTHLY_RATES } },
      { upsert: true, runValidators: true },
    );
  } catch (error) {
    // Another simultaneous dashboard request may create this year's plan first.
    if (error.code !== 11000) throw error;
  }
  res.json({ rates: await FeeRate.find().sort({ academicYear: -1 }) });
}

async function saveRates(req, res) {
  const { academicYear } = req.params;
  const { nursery, lkgTo4, class5 } = req.body || {};
  if (!validAcademicYear(academicYear)) return res.status(400).json({ message: 'Use an academic year such as 2026-27.' });
  const monthlyRates = { nursery: Number(nursery), lkgTo4: Number(lkgTo4), class5: Number(class5) };
  if (Object.values(monthlyRates).some((amount) => !Number.isFinite(amount) || amount < 0 || amount > 100000)) {
    return res.status(400).json({ message: 'Enter valid monthly rates between 0 and 100000.' });
  }
  const existing = await FeeRate.findOne({ academicYear });
  if (existing) {
    const enrollmentCount = await Enrollment.countDocuments({ academicYear });
    const changed = Object.keys(monthlyRates).some((key) => existing.monthlyRates[key] !== monthlyRates[key]);
    if (enrollmentCount && changed) {
      return res.status(409).json({ message: 'This year already has student enrollments. Create a new academic year to use different rates; existing fee histories stay unchanged.' });
    }
    existing.monthlyRates = monthlyRates;
    await existing.save();
    return res.json({ rates: existing });
  }
  const rates = await FeeRate.create({ academicYear, monthlyRates });
  res.status(201).json({ rates });
}

async function listStudents(req, res) {
  const { academicYear = '', search = '', status = '' } = req.query;
  if (academicYear && !validAcademicYear(academicYear)) return res.status(400).json({ message: 'Academic year is invalid.' });
  const filter = {};
  if (['active', 'withdrawn', 'graduated'].includes(status)) filter.status = status;
  if (search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { admissionNumber: { $regex: escaped, $options: 'i' } },
      { guardianPhone: { $regex: escaped, $options: 'i' } },
    ];
  }
  const students = await Student.find(filter).sort({ name: 1 }).lean();
  const enrollments = students.length
    ? await Enrollment.find({ student: { $in: students.map(({ _id }) => _id) } }).sort({ academicYear: -1 }).lean()
    : [];
  const enrollmentsByStudent = new Map();
  for (const enrollment of enrollments) {
    const key = String(enrollment.student);
    enrollmentsByStudent.set(key, [...(enrollmentsByStudent.get(key) || []), enrollment]);
  }
  res.json({ students: students.map((student) => {
    const studentEnrollments = enrollmentsByStudent.get(String(student._id)) || [];
    return {
      ...student,
      enrollment: studentEnrollments.find(({ academicYear: year }) => year === academicYear) || null,
      latestEnrollment: studentEnrollments[0] || null,
    };
  }) });
}

async function createStudent(req, res) {
  const { academicYear, joinedAt } = req.body || {};
  const { errors, student, classLevel, joinedAt: parsedJoinedAt } = normalizeStudentRow(req.body || {});
  if (!validAcademicYear(academicYear)) errors.push('Academic year is invalid.');
  if (!classLevel) errors.push('Choose a class.');
  if (errors.length) return res.status(400).json({ message: errors.join(' ') });
  const rates = await FeeRate.findOne({ academicYear });
  if (!rates) return res.status(409).json({ message: `Add monthly fee rates for ${academicYear} before enrolling students.` });
  try {
    const createdStudent = await Student.create(student);
    try {
      const enrollment = await Enrollment.create({
        student: createdStudent._id,
        academicYear,
        classLevel,
        monthlyFee: monthlyFeeFor(classLevel, rates.monthlyRates),
        joinedAt: parsedJoinedAt || (joinedAt ? new Date(joinedAt) : defaultEnrollmentStart(academicYear)),
      });
      res.status(201).json({ student: createdStudent, enrollment });
    } catch (error) {
      await Student.deleteOne({ _id: createdStudent._id });
      throw error;
    }
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That admission number already exists.' });
    throw error;
  }
}

async function importStudents(req, res) {
  const { academicYear, rows } = req.body || {};
  if (!validAcademicYear(academicYear)) return res.status(400).json({ message: 'Use a valid academic year such as 2026-27.' });
  if (!Array.isArray(rows) || rows.length === 0 || rows.length > 500) return res.status(400).json({ message: 'Upload between 1 and 500 student rows.' });
  const rates = await FeeRate.findOne({ academicYear });
  if (!rates) return res.status(409).json({ message: `Add monthly fee rates for ${academicYear} before importing students.` });

  const seen = new Set();
  const results = [];
  let added = 0;
  let updated = 0;
  let enrolled = 0;
  for (let index = 0; index < rows.length; index += 1) {
    const normalized = normalizeStudentRow(rows[index] || {});
    const rowNumber = Number.isInteger(rows[index]?.rowNumber) ? rows[index].rowNumber : index + 2;
    const { admissionNumber } = normalized.student;
    if (admissionNumber && seen.has(admissionNumber)) normalized.errors.push('Admission number is repeated in this spreadsheet.');
    if (admissionNumber) seen.add(admissionNumber);
    if (normalized.errors.length) {
      results.push({ row: rowNumber, admissionNumber, outcome: 'error', message: normalized.errors.join(' ') });
      continue;
    }

    try {
      let student = await Student.findOne({ admissionNumber });
      const isNew = !student;
      if (!student) student = await Student.create(normalized.student);
      if (student.status === 'graduated') {
        results.push({ row: rowNumber, admissionNumber, outcome: 'error', message: 'This student is already marked graduated.' });
        if (isNew) await Student.deleteOne({ _id: student._id });
        continue;
      }

      let enrollment = await Enrollment.findOne({ student: student._id, academicYear });
      let addedEnrollment = false;
      if (enrollment?.leftAt) {
        results.push({ row: rowNumber, admissionNumber, outcome: 'error', message: 'This student already has a leaving date for the selected year.' });
        if (isNew) await Student.deleteOne({ _id: student._id });
        continue;
      }
      if (enrollment && enrollment.classLevel !== normalized.classLevel) {
        const hasPayments = await FeePayment.exists({ enrollment: enrollment._id });
        if (hasPayments) {
          results.push({ row: rowNumber, admissionNumber, outcome: 'error', message: 'Class cannot be changed for this year because payments already exist.' });
          if (isNew) await Student.deleteOne({ _id: student._id });
          continue;
        }
        enrollment.classLevel = normalized.classLevel;
        enrollment.monthlyFee = monthlyFeeFor(normalized.classLevel, rates.monthlyRates);
        await enrollment.save();
      } else if (!enrollment) {
        enrollment = await Enrollment.create({
          student: student._id,
          academicYear,
          classLevel: normalized.classLevel,
          monthlyFee: monthlyFeeFor(normalized.classLevel, rates.monthlyRates),
          joinedAt: normalized.joinedAt || defaultEnrollmentStart(academicYear),
        });
        addedEnrollment = true;
      }

      const updates = normalized.student;
      student.name = updates.name;
      student.guardianName = updates.guardianName;
      student.guardianPhone = updates.guardianPhone;
      student.status = 'active';
      await student.save();
      if (isNew) added += 1;
      else if (addedEnrollment) enrolled += 1;
      else updated += 1;
      results.push({ row: rowNumber, admissionNumber, outcome: isNew ? 'added' : (addedEnrollment ? 'enrolled' : 'updated'), message: isNew ? 'Student added.' : (addedEnrollment ? 'Student enrolled for this academic year.' : 'Student details updated.') });
    } catch (error) {
      if (error.code === 11000) {
        results.push({ row: rowNumber, admissionNumber, outcome: 'error', message: 'Admission number or academic-year enrollment already exists.' });
      } else {
        throw error;
      }
    }
  }
  res.status(200).json({ summary: { added, enrolled, updated, errors: results.filter(({ outcome }) => outcome === 'error').length }, results });
}

async function enrollStudent(req, res) {
  const { academicYear, classLevel: rawClass, joinedAt } = req.body || {};
  const classLevel = normalizeClass(rawClass);
  if (!validAcademicYear(academicYear) || !classLevel) return res.status(400).json({ message: 'Choose a valid academic year and class.' });
  const [student, rates] = await Promise.all([
    Student.findById(req.params.id),
    FeeRate.findOne({ academicYear }),
  ]);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  if (student.status === 'graduated') return res.status(409).json({ message: 'Graduated students cannot be enrolled in another year.' });
  if (!rates) return res.status(409).json({ message: `Add monthly fee rates for ${academicYear} first.` });
  try {
    const enrollment = await Enrollment.create({
      student: student._id,
      academicYear,
      classLevel,
      monthlyFee: monthlyFeeFor(classLevel, rates.monthlyRates),
      joinedAt: joinedAt ? new Date(joinedAt) : defaultEnrollmentStart(academicYear),
    });
    student.status = 'active';
    await student.save();
    res.status(201).json({ enrollment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This student already has an enrollment for that academic year.' });
    throw error;
  }
}

async function changeStudentStatus(req, res) {
  const { status, leavingDate, enrollmentId } = req.body || {};
  const date = new Date(leavingDate);
  if (!['withdrawn', 'graduated'].includes(status) || !/^[a-f\d]{24}$/i.test(enrollmentId || '') || !leavingDate || Number.isNaN(date.getTime())) {
    return res.status(400).json({ message: 'Choose Withdrawn or Graduated and enter a valid leaving date.' });
  }
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found.' });
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, student: student._id, leftAt: null });
  if (!enrollment) return res.status(409).json({ message: 'No active enrollment was found for this student.' });
  if (status === 'graduated' && enrollment.classLevel !== 'Class 5') return res.status(400).json({ message: 'Only a Class 5 student can be marked graduated.' });
  if (date < enrollment.joinedAt) return res.status(400).json({ message: 'Leaving date cannot be before the enrollment date.' });
  enrollment.leftAt = date;
  await enrollment.save();
  await Enrollment.updateMany(
    { student: student._id, academicYear: { $gt: enrollment.academicYear }, leftAt: null },
    { $set: { leftAt: date } },
  );
  student.status = status;
  await student.save();
  res.json({ student, enrollment, message: `Student marked ${status}. Fees remain due through the leaving month.` });
}

async function listLedger(req, res) {
  const { academicYear, month, search = '', status = '' } = req.query;
  if (!validAcademicYear(academicYear) || !monthBelongsToYear(month, academicYear)) {
    return res.status(400).json({ message: 'Choose an academic year and a month within that year.' });
  }
  const { start, end } = periodDates(month);
  const enrollments = await Enrollment.find({ academicYear }).populate('student').sort({ classLevel: 1 });
  const yearEnrollments = enrollments.filter((enrollment) => {
    if (!enrollment.student) return false;
    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const student = enrollment.student;
      if (!student.name.toLowerCase().includes(query) && !student.admissionNumber.toLowerCase().includes(query)) return false;
    }
    return true;
  });
  const matched = yearEnrollments.filter((enrollment) => !(enrollment.joinedAt > end || (enrollment.leftAt && enrollment.leftAt < start)));
  const enrollmentIds = matched.map(({ _id }) => _id);
  const existingRecordCount = matched.length
    ? await MonthlyFeeRecord.countDocuments({ enrollment: { $in: enrollmentIds }, month })
    : 0;
  if (matched.length && existingRecordCount < matched.length) {
    const legacyPayments = await FeePayment.aggregate([
      { $match: { enrollment: { $in: enrollmentIds }, month } },
      { $group: { _id: { enrollment: '$enrollment', month: '$month' }, total: { $sum: '$amount' } } },
    ]);
    const legacyPaidByEnrollmentMonth = new Map(legacyPayments.map(({ _id, total }) => [`${_id.enrollment}:${_id.month}`, total]));
    await MonthlyFeeRecord.bulkWrite(matched.map((enrollment) => ({
      updateOne: {
        filter: { enrollment: enrollment._id, month },
        update: { $setOnInsert: {
          student: enrollment.student._id,
          enrollment: enrollment._id,
          academicYear,
          month,
          amountDue: enrollment.monthlyFee,
          status: (legacyPaidByEnrollmentMonth.get(`${enrollment._id}:${month}`) || 0) >= enrollment.monthlyFee ? 'paid' : 'unpaid',
          updatedBy: req.admin._id,
        } },
        upsert: true,
      },
    })), { ordered: false });
  }
  const records = matched.length
    ? await MonthlyFeeRecord.find({ enrollment: { $in: matched.map(({ _id }) => _id) }, month }).lean()
    : [];
  const recordsByEnrollment = new Map(records.map((record) => [String(record.enrollment), record]));
  let ledger = matched.map((enrollment) => {
    const student = enrollment.student.toObject();
    const monthlyRecord = recordsByEnrollment.get(String(enrollment._id));
    const paymentStatus = monthlyRecord?.status || 'unpaid';
    const paidAmount = paymentStatus === 'paid' ? enrollment.monthlyFee : 0;
    const balance = paymentStatus === 'paid' ? 0 : enrollment.monthlyFee;
    return {
      enrollmentId: enrollment._id,
      monthlyRecordId: monthlyRecord?._id,
      student: { _id: student._id, admissionNumber: student.admissionNumber, name: student.name, guardianName: student.guardianName, guardianPhone: student.guardianPhone, status: student.status },
      classLevel: enrollment.classLevel,
      monthlyFee: enrollment.monthlyFee,
      amountPaid: paidAmount,
      balance,
      status: paymentStatus,
      joinedAt: enrollment.joinedAt,
      leftAt: enrollment.leftAt,
    };
  });
  if (['paid', 'unpaid'].includes(status)) ledger = ledger.filter((row) => row.status === status);
  res.json({ ledger, totalStudents: ledger.length, month, academicYear });
}

async function updateMonthlyFeeStatus(req, res) {
  const { enrollmentId, academicYear, month, status } = req.body || {};
  if (!/^[a-f\d]{24}$/i.test(enrollmentId || '') || !validAcademicYear(academicYear) ||
      !monthBelongsToYear(month, academicYear) || !['paid', 'unpaid'].includes(status)) {
    return res.status(400).json({ message: 'Choose a valid student, academic year, month, and Paid/Unpaid status.' });
  }
  const enrollment = await Enrollment.findById(enrollmentId).populate('student');
  if (!enrollment || !enrollment.student || enrollment.academicYear !== academicYear) {
    return res.status(404).json({ message: 'Enrollment not found for that academic year.' });
  }
  const { start, end } = periodDates(month);
  if (enrollment.joinedAt > end || (enrollment.leftAt && enrollment.leftAt < start)) {
    return res.status(400).json({ message: 'Student was not enrolled during that month.' });
  }
  const record = await MonthlyFeeRecord.findOneAndUpdate(
    { enrollment: enrollment._id, month },
    { $set: { status, amountDue: enrollment.monthlyFee, updatedBy: req.admin._id, statusChangedAt: new Date() },
      $setOnInsert: { student: enrollment.student._id, academicYear, month } },
    { new: true, upsert: true, runValidators: true },
  );
  res.json({ record, message: `Fee status changed to ${status}.` });
}

async function recordPayment(req, res) {
  const { enrollmentId, month, amount, paidAt, method = 'cash', receiptNumber = '', note = '' } = req.body || {};
  const parsedAmount = Number(amount);
  const paidDate = paidAt ? new Date(paidAt) : new Date();
  if (!/^[a-f\d]{24}$/i.test(enrollmentId || '') || !validMonth(month) || !Number.isFinite(parsedAmount) || parsedAmount <= 0 ||
      !Number.isFinite(paidDate.getTime()) || paidDate > new Date() || !['cash', 'upi', 'bank', 'other'].includes(method) ||
      typeof receiptNumber !== 'string' || receiptNumber.length > 80 || typeof note !== 'string' || note.length > 500) {
    return res.status(400).json({ message: 'Enter a valid payment amount, date, method, and receipt details.' });
  }
  const enrollment = await Enrollment.findById(enrollmentId).populate('student');
  if (!enrollment || !enrollment.student) return res.status(404).json({ message: 'Enrollment not found.' });
  if (enrollment.academicYear === '' || !monthBelongsToYear(month, enrollment.academicYear)) return res.status(400).json({ message: 'Payment month does not match the enrollment year.' });
  if (month > currentMonth()) return res.status(400).json({ message: 'Fees can be recorded only for the current or a past month.' });
  const { start, end } = periodDates(month);
  if (enrollment.joinedAt > end || (enrollment.leftAt && enrollment.leftAt < start)) return res.status(400).json({ message: 'Student was not enrolled during that month.' });
  const existing = await FeePayment.aggregate([
    { $match: { enrollment: enrollment._id, month } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const paidAlready = existing[0]?.total || 0;
  const outstanding = Math.round((enrollment.monthlyFee - paidAlready) * 100) / 100;
  const roundedAmount = Math.round(parsedAmount * 100) / 100;
  if (roundedAmount > outstanding) return res.status(400).json({ message: `Payment is higher than the remaining balance of ₹${outstanding}.` });
  const payment = await FeePayment.create({
    student: enrollment.student._id,
    enrollment: enrollment._id,
    academicYear: enrollment.academicYear,
    month,
    amount: roundedAmount,
    paidAt: paidDate,
    method,
    receiptNumber: receiptNumber.trim(),
    note: note.trim(),
    recordedBy: req.admin._id,
  });
  res.status(201).json({ payment, message: 'Payment recorded.' });
}

module.exports = { getRates, saveRates, listStudents, createStudent, importStudents, enrollStudent, changeStudentStatus, listLedger, updateMonthlyFeeStatus, recordPayment };
