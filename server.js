const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const session = require('express-session');
const path = require('path');

dotenv.config();

if (!process.env.SESSION_SECRET || !process.env.MONGO_URI) {
    console.error('FATAL ERROR: Make sure SESSION_SECRET and MONGO_URI are defined in your environment variables.');
    process.exit(1); // Exit the process with an error code
}
const app = express();  

//view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,

}));

//mongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log('MongoDB error:', err));

//routes
const authRoutes = require('./routes/authRoutes');
app.use('/', authRoutes);

//start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
