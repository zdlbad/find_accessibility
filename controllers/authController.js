const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const EmailSender = require('../utils/emailSender');

const signToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRESIN,
  });
};

const createSendToken = (user, res) => {
  user.password = undefined;
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(Date.now() + process.env.COOKIE_EXPIRESIN_MINUS * 60 * 1000),
    secure: true,
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'development') cookieOption.secure = false;

  res.cookie('jwt', token, cookieOption);

  res.status(202).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createSendToken(newUser, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  //1. get token from req.headers.authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bear')) {
    token = req.headers.authorization.split(' ')[1];
    //console.log(`- Token found: ${token}`);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  //2. check token exist
  if (!token) return next(new Error('No token found'));

  //3. check token valid
  const payload = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //console.log(`- payload got: ${JSON.stringify(payload)}`);

  //4. check user exist
  const user = await User.findById(payload.id).select('+photo');
  if (!user) return next(new Error('No user is found under this token.'));

  //console.log(`- user found: ${user}`);

  //5. check user changed password or not
  if (user.isPasswordChangedAfter(payload.iat)) return next(new Error('Your login is expired due to password change.'));

  //6. save user
  req.user = user;
  res.locals.user = user;

  next();
});

exports.login = catchAsync(async (req, res, next) => {
  //1. get user & pwd
  const { email, password } = req.body;

  //2. find user
  const user = await User.findOne({ email }).select('+password');

  //3. check pwd
  if (!user || !(await user.isPasswordCorrect(password, user.password)))
    return next(new Error('Incorrect email or password.'));

  //4. return a token
  createSendToken(user, res);
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return next(new Error('You have no permission to access this route.'));
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1. get email
  const { email } = req.body;

  if (!email) return next(new Error('Email not found.'));

  //2. search user
  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new Error('User not found.'));

  //3. create password reset token
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  //4. form token url
  const resetURL = `${req.protocol}://${req.get('host')}/app/resetPassword/${resetToken}`;

  //5. send email
  const emailSender = new EmailSender(email, resetURL);
  await emailSender.send();

  res.status(200).json({
    status: 'success',
    data: {
      resetURL,
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1. re-encrypt token
  const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  //2. search user by token and token expiration time

  const user = await User.findOne({
    passwordResetToken: resetToken,
    passowrdResetTokenExpiration: { $gte: Date.now() },
  });

  if (!user) return next(new Error('Token invalid or expired.'));

  //3. update user password fields
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passowrdResetTokenExpiration = undefined;

  await user.save();

  //4. log in user by sending JWT
  createSendToken(user, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1. find user by ID
  const user = await User.findById(req.user._id).select('+password');

  //2. check previous password
  if (!(await user.isPasswordCorrect(req.body.oldPassword, user.password)))
    return next(new Error('Password is not correct.'));

  //3. update password
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  user.save();

  //4 login user
  const newUser = await User.findById(req.user._id);
  createSendToken(newUser, res);
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //1. get token from req.headers.authorization
  if (req.cookies.jwt) {
    try {
      const token = req.cookies.jwt;

      //3. check token valid
      const payload = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);

      //4. check user exist
      const user = await User.findById(payload.id).select('+photo');
      if (!user) return next();

      //5. check user changed password or not
      if (user.isPasswordChangedAfter(payload.iat)) return next();

      //6. save user
      res.locals.user = user;
    } catch (err) {
      return next();
    }
  }
  next();
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
};
