const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const locationRouter = require('./routes/locationRoutes');
const authRouter = require('./routes/authRoutes');
const viewRouter = require('./routes/viewRoutes');
const errorController = require('./controllers/errorController');

const app = express();


app.get('/favicon.ico', (req, res) => res.status(204));

//set static files folder
app.use(express.static(path.join(__dirname, 'public')));

//views - pug
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//security
app.use(morgan('dev'));
app.use(rateLimit({ max: 10, windowMs: 5 * 1000, message: 'You can only send 3 request within 5 seconds.' }));
app.use(helmet());
app.use(mongoSanitize());
app.use(xssClean());
app.use(express.json({ limit: '10kb' }));
app.use(hpp({ whitelist: ['duration', 'ratingsAverage', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price'] }));

// parser middleware
app.use(cookieParser());

//route
app.use('/app/', viewRouter);
app.use('/app/api/auth', authRouter);
app.use('/app/api/users', userRouter);
app.use('/app/api/locations', locationRouter);
app.use('/app/api/reviews', reviewRouter);
app.all('*', (req, res, next) => {
  next(new Error(`Cannot find ${req.originalUrl} on this server.`));
});

// error controller
app.use(errorController);

module.exports = app;
