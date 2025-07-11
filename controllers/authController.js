const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendVerificationEmail = require('../helpers/sendVerificationEmail');


// Landing Page
exports.getLanding = (req, res) => {
  res.render('landing');
};


// GET Signup Form
exports.getSignup = (req, res) => {
  res.render('signup', {message: null});
};


// POST Signup Form
exports.postSignup = async (req, res) => {
  const { name, age, email, password } = req.body;


  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { message: 'User already exists. Try logging in.' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1d' });


    const user = new User({
      name,
      age,
      email,
      password: hashedPassword,
      verificationToken,
      role: 'user' // optional as 'user' is default in schema
    });


    await user.save();
    await sendVerificationEmail(email, verificationToken);


    res.render('signup', { message: 'Signup successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error("Error signing up", err);
    return res.render('signup', { message: 'Server error during signup.' });
  }
};


// GET Login Form
exports.getLogin = (req, res) => {
  res.render('login', {message: null});
};


// POST Login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;


  try {
    const user = await User.findOne({ email });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.render('login', { message: 'Invalid email or password.' });
    }


    if (!user.isVerified) {
      return res.render('login', { message: 'Please verify your email before logging in.'});
    }


    req.session.user = user;


    if (user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    } else {
      return res.redirect('/user/dashboard');
    }
   
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during login.');
  }
};


// Email Verification Handler
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });


    if (!user) return res.render('verify', { message: 'Invalid verification link.' });
if (user.isVerified) return res.render('verify', { message: 'Email already verified.' });


    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();


    res.render('verify', { email: user.email , message: 'Email verified successfully! You can now log in.' });
  } catch (err) {
    console.error(err);
    res.send('Email verification failed or token expired.');
  }
};