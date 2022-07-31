const AppError = require('./../utils/appError');

const handelCastErrorDB = err => {
    const message = `invalid ${err.path} : ${err.value}`;
    return new AppError(message,404);
};

const handelDuplicateErrorDB = err => {
    const value = err.aeemsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value} .please use another value`;
    return new AppError(message, 404);
}
const handelValidationErrorDB = err => {
    const errors = object.values(err.errors).map(el => el.message);
    const message = `invalid input data ${errors.join('. ')}`;
    return new AppError(message,404);
}
const handelJWTError = () => {
    return new AppError('invalid token place login again',401);
}
const handelJWTExpireedError = () => {
    return new AppError('your token expired place login again',401);
}
const sendErrorDev = (err,req, res) => {
    //A) API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err, 
            message: err.message,
            stack: err.stack
        });
    }
    //B) RENDERING WEBSITE
    return res.status(err.statusCode).render('error',{
        title:'some thing went erong',
        msg: err.message
    });
};

const sendErrorProd = (err,req,res) => {
    //A) API
    //operational, trusted error: send message to client
    if(req.originalUrl.startsWith('/api')){
        if(err.isOperational){
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
                });
        }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('Error',err);
    // 2)send generic message
    res.status(500).json({
        status: 'Error',
        message: 'something went very wrong '
    });     
    }
    //RENDER WEBSITE
    if(err.isOperational){
        console.log(err);
        return res.status(err.statusCode).render('erroe',{
            title:'someThing went wrong',
            msg: err.message
        });
    }
    //1)Log Error
    console.log(err);
    // 2) Send generic message
    return res.status(err.statusCode).render('error',{
        title:'something went wrong',
        msg: 'please try again later '
    });
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development'){
        sendErrorDev(err,req ,res);
    }
    else if(process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        if(error.name === 'CastError') error = handelCastErrorDB(error);
        if(error.code === 11000) error = handelDuplicateErrorDB(error);
        if(error.name === 'error.ValidationError') error = handelValidationErrorDB(error);
        if(error.name === 'JsonWebTokenError') error = handelJWTError();
        if(error.name === 'TokenExpiredError') error = handelJWTExpireedError();
        sendErrorProd(error,req, res);
    }
    
};