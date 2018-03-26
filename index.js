const express = require('express');
const mongoose = require('mongoose');
const keys = require('./config/keys');
mongoose.connect(keys.mongoURI);
require('./models/Ping');

const app = express();
require('./routes/pingRoutes')(app);

app.listen(5000);
