const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const objectFilter = require('../utils/objectFilter');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/image/users');
//   },
//   filename: (req, file, cb) => {
//     const extension = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extension}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only image.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(50, 50)
    .toFormat('jpeg')
    .jpeg({ quality: 50 })
    .toFile(`public/image/users/${req.file.filename}`);

  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //1. get user from protected req, and check property
  if (req.body.password || req.body.passwordConfirm)
    return next(new Error('Password is not allowed to be updated in this way.'));

  if (req.body.role) return next(new Error('Role is not allowed to be updated in this way.'));

  console.log(req.file);
  console.log(req.body);

  //2. filter the parameter, only accept name, email change
  const newFields = objectFilter.include(req.body, 'name');
  newFields.photo = req.file.filename;

  //3. update new user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, newFields, {
    new: true,
    runValidators: true,
  });

  req.user = updatedUser;
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.getUsers = async (req, res) => {
  try {
    const query = User.find();
    const users = await query;
    res.status(200).json({
      status: 200,
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      status: 500,
      message: err,
    });
  }
};
