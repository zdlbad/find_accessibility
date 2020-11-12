const catchAsync = require('../utils/catchAsync');

exports.getHomePage = catchAsync(async (req, res, next) => {
  res.status(200).render('homepage');
});

exports.login = (req, res, next) => {
  res.status(200).render('loginpage');
};

exports.signup = (req, res, next) => {
  res.status(200).render('signuppage');
};

exports.getMyPage = (req, res, next) => {
  console.log(req.user);
  res.status(200).render('mypage', {
    user: req.user,
  });
};

exports.getUpdatePage = (req, res, next) => {
  res.status(200).render('updatemepage');
};

exports.getUpdatePasswordPage = (req, res, next) => {
  res.status(200).render('updatepasswordpage');
};

exports.getForgotPasswordPage = (req, res, next) => {
  res.status(200).render('forgotpassword');
};

exports.getResetPasswordPage = (req, res, next) => {
  res.status(200).render('resetpassword', {
    authUrl: `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${req.params.token}`,
  });
};
