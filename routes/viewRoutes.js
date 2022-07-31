const express = require('express');
const viewsController = require('./../controllers/viewController');
const bookingController = require('./../controllers/bookingController');

const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/',bookingController.creatingBookCheckout ,authController.isLoggedIn, viewsController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

router.get('/my-toure', authController.protect, viewsController.getMyTours);


router.post('/submit-user-data',authController.protect,viewsController.updateUserData);

module.exports = router;
