module.exports = (err, req, res, next) => {
  console.log('- Error catched by controller : \n', err.stack);

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  console.log('----', err.statusCode, err.status);

  res.status(500).json({
    status: err.status,
    message: err.message,
  });
};
