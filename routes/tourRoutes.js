const express = require('express');
const tourController = require ('../controllers/tourController');
const authController = require ('../controllers/authController');
const reviewRoouter = require('./../routes/reviewRoutes');

const router = express.Router();     //make route name route

router.use('/:tourId/reviews',reviewRoouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours,tourController.getAllTours);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);


router
    .route('/month-plan/:year')
    .get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthPlan);

router
    .route('/distance/:latlng/unit/:unit')
    .get(tourController.getDistances);
router
    .route('/tours-witnin/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
router
    .route('/')
    .get(authController.protect,tourController.getAllTours)
    .post(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.createTour);  //first check the middleware (checkBody) if done go to route 

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect,
        authController.restrictTo('admin','lead-guide'),
        tourController.uploadTourPhoto,
        tourController.resizeTourPhoto,
        tourController.updateTour)
    .delete(authController.protect,
            authController.restrictTo('admin','lead-guide'),
            tourController.deleteTour);


    module.exports = router;