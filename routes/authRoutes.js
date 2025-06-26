const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', authController.getLanding);
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);

router.get('/verify-email', authController.verifyEmail);

module.exports = router;