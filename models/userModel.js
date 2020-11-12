const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
  name: String,
  email: {
    type: String,
    required: [true, 'User must have a email.'],
    unique: [true, 'Email already exists.'],
  },
  password: {
    type: String,
    required: [true, 'User must have a password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User must have a password confirm'],
    select: false,
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Password should be same as passwordConfirm',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    select: false,
  },
  photo: {
    type: String,
    default: 'no_photo.jpg',
    select: false,
  },
  passwordChangedAt: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passowrdResetTokenExpiration: {
    type: Date,
    select: false,
  },
});

// encrypt password before save to db
userSchema.pre('save', async function (next) {
  // this method is particularly for setting password
  if (!this.isModified('password')) return next();

  this.password = await bcryptjs.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
});

// update password change time if password is modified
userSchema.pre('save', function (next) {
  // this method is particularly for setting password
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now();

  next();
});

// check if input password is correct
userSchema.methods.isPasswordCorrect = async function (plainPassword, encryptedPassword) {
  return await bcryptjs.compare(plainPassword, encryptedPassword);
};

userSchema.methods.isPasswordChangedAfter = function (iat) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return changedTime > iat;
  }

  return false;
};

userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.passowrdResetTokenExpiration = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
