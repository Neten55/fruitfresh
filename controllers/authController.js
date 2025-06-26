const User = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Setup nodemailer transporter
// IMPORTANT: Use environment variables for credentials in your .env file
// For development, you can use a service like Ethereal or Mailtrap
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service
    auth: {
        user: process.env.EMAIL_USER, // e.g., 'your.email@gmail.com'
        pass: process.env.EMAIL_PASS, // e.g., an app-specific password for gmail
    },
});

exports.getLanding = (req, res) => {
    // Assuming you have a landing.ejs view
    res.render('landing');
};

exports.getSignup = (req, res) => {
    // Assuming you have a signup.ejs view
    res.render('signup');
};

exports.postSignup = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            // Note: In a production app, you might not want to reveal that the email is already in use.
            return res.status(400).send('Email already in use.');
        }

        const emailToken = crypto.randomBytes(64).toString('hex');

        const newUser = new User({ email, password, emailToken });
        await newUser.save();

        // Send verification email
        const verificationLink = `http://${req.headers.host}/verify-email?token=${emailToken}`;
        const mailOptions = {
            from: `"FruitFresh" <${process.env.EMAIL_USER}>`,
            to: newUser.email,
            subject: 'Verify Your Email Address',
            html: `<p>Hello,</p><p>Please verify your email by clicking on the link below:</p><a href="${verificationLink}">${verificationLink}</a>`,
        };

        // You can uncomment the line below once you have configured your email transporter
        // await transporter.sendMail(mailOptions);

        res.send('Registration successful! Please check your email to verify your account.');

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).send('Error during registration.');
    }
};

exports.getLogin = (req, res) => {
    // Assuming you have a login.ejs view
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send('Invalid email or password.');
        }

        if (!user.isVerified) {
            return res.status(401).send('Please verify your email before logging in.');
        }

        // Set up session
        req.session.userId = user._id;
        res.send('Login successful!'); // Ideally, redirect to a protected page e.g., res.redirect('/dashboard');

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).send('Error during login.');
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await User.findOne({ emailToken: token });

        if (!user) {
            return res.status(400).send('Invalid or expired verification link.');
        }

        user.emailToken = undefined; // Use undefined to have MongoDB remove the field
        user.isVerified = true;
        await user.save();

        res.send('Email verified successfully! You can now log in.'); // e.g., res.redirect('/login');
    } catch (error) {
        console.error('Email Verification Error:', error);
        res.status(500).send('Error verifying email.');
    }
};