const express = require('express');
const controller = require('../controllers/fee.controller');
const requireAdmin = require('../middleware/requireAdmin');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();
router.use(requireAdmin);

router.get('/rates', controller.getRates);
router.put('/rates/:academicYear', controller.saveRates);
router.get('/students', controller.listStudents);
router.post('/students', controller.createStudent);
router.post('/students/import', controller.importStudents);
router.post('/students/:id/enrollments', validateObjectId, controller.enrollStudent);
router.patch('/students/:id/status', validateObjectId, controller.changeStudentStatus);
router.get('/ledger', controller.listLedger);
router.patch('/ledger/status', controller.updateMonthlyFeeStatus);
router.post('/payments', controller.recordPayment);

module.exports = router;
