const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');

dotenv.config(); // Loads environment variables from .env file (for local development)

// IMPORTANT: This check should be placed after dotenv.config()
// but before any attempts to use these variables, or app setup.
if (!process.env.SESSION_SECRET) {
    console.error('FATAL ERROR: SESSION_SECRET is not defined in your environment variables.');
    process.exit(1); // Exit the process with an error code
}
if (!process.env.MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in your environment variables.');
    process.exit(1); // Exit the process with an error code
}

const app = express();  

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: false })); // For parsing application/x-www-form-urlencoded
app.use(express.static('public')); // Serving static files from 'public' directory

app.use(session({
    secret: process.env.SESSION_SECRET, // Use the environment variable for the session secret
    resave: false, // Prevents resaving session if not modified
    saveUninitialized: false, // Prevents saving uninitialized sessions
}));

// MongoDB Connection
// The server will only start listening AFTER a successful database connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB connected successfully!'); // More descriptive message
        
        // Define the port, prioritizing Render's PORT environment variable
        const PORT = process.env.PORT || 3000; 

        // Start server only after MongoDB connection is established
        app.listen(PORT, () => {
            console.log(Server is running on port ${PORT});
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err); // Use console.error for errors
        process.exit(1); // Exit the process if MongoDB connection fails
    });

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

// Any other routes or error handling middleware can go here