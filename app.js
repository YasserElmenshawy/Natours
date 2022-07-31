const path = require('path');
const express = require('express');          //express frame work
const morgan = require('morgan');            //morgan is middleware that return data about request like status,size,time
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const vierRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/erroeController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const app = express();                       //create object fron express


app.set('view engine', 'pug');               // use Pug template enginte
app.set('views',path.join(__dirname,'views'));
// 1) Glopel MIDDLEWARE

//serving static file
app.use(express.static(path.join(__dirname,'public'))); //middleware to read static file    

//set security HTTP headers
//app.use(helmet()); 
//LIMIT request from same  API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many request from this ip, please try again in an hour"
});
app.use('/api', limiter);
// develper loggin
app.use(morgan('dev'));

//Body parser reading data from the body into req.body
app.use(express.json({limit: '10kb'})); //limit to limit data come from body to 10Kb if large get error // this is middleware that recive data that come from request.bady(to access request.body) 
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(cookieParser());
//data sanitization fron NoSQL query injection
app.use(mongoSanitize());
//Data sanitization from xss
app.use(xss());
// prevent paramter pollution
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));

app.use('/',vierRouter);
app.use('/api/v1/tours',tourRouter);      //monting route
app.use('/api/v1/users',userRouter);      //monting route
app.use('/api/v1/reviews',reviewRouter);
app.use('/api/v1/bookings',bookingRouter);

// handeling unfond router 
app.all('*',(req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server!!`, 404));
});

app.use(globalErrorHandler);
module.exports = app;