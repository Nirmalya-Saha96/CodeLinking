const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

//connecting the db first
connectDB();

app.use(bodyParser.json());

//defining routes
app.use('/api/users', require('./routes/api/user'));
app.use('/api/admin', require('./routes/api/admin'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=> console.log("Server started on port " +  PORT));
