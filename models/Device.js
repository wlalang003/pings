const mongoose = require('mongoose');
const { Schema } = mongoose;

const deviceSchema = new Schema({
  deviceId: String
});

mongoose.model('devices', deviceSchema);
