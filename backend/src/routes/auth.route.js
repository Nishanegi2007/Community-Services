const express=require('express');
const { rateLimit }=require('express-rate-limit');
const authController=require('../controllers/auth.controller');
const requireAdmin=require('../middleware/requireAdmin');


const router=express.Router();
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts. Please try again later.' },
});

router.post('/login',authLimiter,authController.login);
router.post('/logout',authController.logout);
router.get('/me',requireAdmin,authController.me);

module.exports = router;
