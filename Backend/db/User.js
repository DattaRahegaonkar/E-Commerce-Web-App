
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

const Users = mongoose.model("Users", UserSchema)


module.exports = Users;