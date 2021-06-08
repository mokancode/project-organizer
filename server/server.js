const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const http = require('http');
const dotenv = require('dotenv').config();
// const cors = require('cors');
const path = require('path');

const users = require('./routes/api/users');
// const quizzes = require('./routes/api/quizzes');

const app = express();
var server = http.createServer(app);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

app.use('/api/users', users);

if (process.env.NODE_ENV === "production") {
    // console.log("prod mode");
    app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
    app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '..', 'client', 'build', 'index.html')));
}
else {
    app.get('/', (req, res) => {
        res.send("Project Organizer API is running. v1.0.0");
    });
}

// DB config
const db = process.env.MONGO_URI;

// Connect to MongoDB
mongoose
    .connect(db, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => { console.log("MongoDB connected") })
    .catch(err => { console.log("MongoDB error: ", err) });


const port = process.env.PORT || 5001;
server.listen(port, () => {
    console.log(`Server running on port ${port} in ${process.env.NODE_ENV} mode`);
})