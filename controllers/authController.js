const crypto = require('crypto');
const {promisify} = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/errorAsync');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const { findOne } = require('./../models/userModel');

const createSendToken = (user,statusCode,res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expire: new Date(
            Date.now() + process.env.JWT_EXPIRES_COOKIE_IN * 24 * 60 *60 * 1000 //to convert date in millesec
            ),
            httpOnly: true //cookie can't modified by browser
    };
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true; //cookie send in encrypt conection

    res.cookie('jwt',token,cookieOptions);
    // remove password from output
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

const signToken = id => {
    return jwt.sign({ id:id}, process.env.JWT_SECRET,{ 
        expiresIn: process.env.JWT_EXPIRES_IN});
};
exports.signup = catchAsync(async (req,res,next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcom();
    createSendToken(newUser,201,res);
});

exports.login = catchAsync(async (req,res,next) => {
    const {email,password} = req.body;
    //1) check if email and password enter
    if(!email || !password){
    return next(new AppError('you shoud enter password and email',400));
    }
    //2) check if email exist & password correct
    const user = await User.findOne({email}).select('+passworsd');

    if(!user || !(await user.correctPassword(password,user.password))){ //correctPassword is method in model to compare two password and return true  or false
        return next(new AppError('email or password not valid',401));
    }
    //3) if every thing success send token to client
    createSendToken(user,200,res);
});

exports.protect = catchAsync(async(req, res, next) => {
    //1)Getting token and check of it's there
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
    if(!token){
        return next(new AppError('you are not logged in , plase login to get access ',401));
    }
    //2)verification token  
    const decode = await promisify(jwt.verify)(token,process.env.JWT_SECRET);
    //3)check if user still exist
    const currentUser  = await User.findById(decode.id);
    if(!currentUser){
        return next(new AppError('the user belong to thihs token dose no been loggin',401));
    }
    //4)check if user change password after the token was issued
    if(currentUser.changepasswordAfter(decode.iat)){
        return next(new AppError('user recentlly change password, place login again',401));
    }

    //5)grate access to protect proute
    req.user = currentUser;
    res.locals.user = currentUser;

    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('your not have permission to this action',403));
        }
    next();
    };
}

exports.forgotPasswors = catchAsync(async(req, res, next) => {
    //1)check your email exsist or not
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('you email not found',404));
    }
    //2)create reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    //3)send email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        await new Email(user,resetURL).sendPasswordReset();
        res.status(200).json({
            status: 'success',
            message: 'token send to mail'
        });
    } catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('there was an error sending the email, try again later!',500));
    }
}); 

exports.resetPassword = catchAsync(async(req, res, next) => {
    //1)get user based on token
    const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    const user =  await User.findOne({passwordResetToken:hashedToken, passwordResetExpires: {$gt:Date.now()}});
    //2)if token has not expired and user , set the new password
    if(!user){
        return next(new AppError('the token is expired',400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
     //3) update changePasswordAt property for the user
    
    // 4) log the user in, send JWT
    createSendToken(user,201,res);
});

exports.updatePassword = catchAsync(async (req,res,next) => {
    //1)get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //const oldPassword = req.body.oldPassword;
    //2)checked if posted current password is correct 
    if(!await(user.correctPassword(req.body.PasswordCurrent,user.password))){
        return next(new AppError('your current password your enter is not valid!',401));
    }
    /*
    if(!await(user.correctPassword(oldPassword,user.password))){
        return next(new AppError('your current password your enter is not valid!',401));
    }
    */
    //3)if so update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    //4)login user and send jwt
    createSendToken(user,200,res)
});

exports.isLoggedIn = async(req, res, next) => {
    //1)verify token
    if(req.cookies.jwt){  
        try{
        const decode = await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET);
        
        //2)check if user still exist
        const currentUser  = await User.findById(decode.id);
        if(!currentUser){
            return next();
        }
        //3)check if user change password after the token was issued
        if(currentUser.changepasswordAfter(decode.iat)){
            return next();
        }

        //4)grate access to protect proute
        res.locals.user = currentUser;
        return next();
    } catch(err) {
        return next();
    }
    }
    //there is localed in user
    next();
};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};