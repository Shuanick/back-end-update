  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const saltRounds = 10;

  const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  });

  userSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();
    
    bcrypt.hash(this.password, saltRounds, (err, hash) => {
      if (err) return next(err);

      this.password = hash;
      next();
    });
  });

  userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };

  module.exports = mongoose.model('User', userSchema);