require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./db/User');

mongoose.connect(process.env.MONGO_URI)
  .then(() => User.countDocuments())
  .then(count => {
    console.log(count > 0 ? 'yes' : 'no');
    mongoose.connection.close();
  })
  .catch(() => {
    console.log('no');
    mongoose.connection.close();
  });
