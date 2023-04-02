const dotenv = require("dotenv");
dotenv.config();

// Environment Variables
const PORT = process.env.PORT;

// Libraries
const express = require("express");
const app = express();
const bodyParser = require('body-parser');

// MongoDB and Sessions
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connects to the MongoDB
mongoose.connect(process.env.MONGO_DB_URL)
    .then(() =>{ console.log("Connected to DB") })
    .catch(err => { console.log(`Error: ${err.message}`)});

const db = mongoose.connection;

//Creates a store object with options
const store = new MongoStore({
    mongoUrl: process.env.MONGO_DB_URL,
    dbName: "Stanify",
    collectionName: 'sessions',
    autoRemove: 'native',
    ttl: 24 * 7 * 60 * 60
})

// Uses a cookie parser middleware
app.use(cookieParser());
// Uses the session middleware to create a session
// whenever user accesses the website
app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: true,
    store: store,
}))

// Application will serve the html and css in the public directory
app.use(express.static("public"));

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes
app.use('/spotify', require('./routes/spotify'))
app.use('/session', require('./routes/Session'))

// View Engine
app.set('views', './views')
app.set('view engine', 'ejs');

// Start up the server
app.listen(PORT, () =>{
    console.log("Welcome to the server");
})

module.exports = db;