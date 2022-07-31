const express = require('express');
const userController = require ('../controllers/userController');
const authController = require ('../controllers/authController');

const router = express.Router();     //make route name router

router.post('/signup',authController.signup);
router.post('/login',authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword',authController.forgotPasswors);
router.patch('/resetPassword/:token',authController.resetPassword);

//protect all router after this middleware
router.use(authController.protect);

router.patch('/updatePassword',authController.updatePassword);
router.patch('/updateMe',userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.delete('/deleteMe',userController.deleteMe);
router.get('/me',userController.getMe,userController.getUser);

router.use(authController.restrictTo('admin'));

router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUsers);
router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

    module.exports = router;
