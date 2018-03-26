const mongoose = require('mongoose');
const { Schema } = mongoose;

const pingSchema = new Schema({
  deviceId: String,
  epochTime: Date
});

mongoose.model('pings', pingSchema);
