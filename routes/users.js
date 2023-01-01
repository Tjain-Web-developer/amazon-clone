const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/shop');

const userSchema = mongoose.Schema({
  username: String,
  email: String,
  password: String,
  cart: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'item'
    }
  ]
});

userSchema.plugin(plm);
module.exports = mongoose.model('user',userSchema)