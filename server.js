const dotenv = require("dotenv");
dotenv.config();

// Environment Variables
const PORT = process.env.PORT;

// Libraries
const express = require("express");
const axios = require("axios");
const app = express();
const bodyParser = require('body-parser');

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Routes
app.use('/spotify', require('./routes/spotify'))

// View Engine
app.set('views', './views')
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs', { artistData: undefined });
})

// Start up the server
app.listen(PORT, () =>{
    console.log("Welcome to the server");
})