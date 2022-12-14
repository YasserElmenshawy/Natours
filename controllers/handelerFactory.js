const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/errorAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError('no document found with this id',404)); 
    }
    res.status(200).json({
        status:'seccess',
        data: null
    });
});

exports.updateOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc){
        return next(new AppError('no document found with this id',404)); 
    }
    res.status(200).json({
        status:'seccess',
        data: {
            data: doc
        }
    });
});

exports.createOne = Model => catchAsync(async (req,res,next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
        status:'seccess',
        data: {
            data: doc
        }
    });
})

exports.getOne = (Model, popOptions) => 
    catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if(popOptions) query = query.populate(popOptions);
    const doc = await query;

    if(!doc){
        return next(new AppError('document not found',404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    });
});

exports.getAll = Model => catchAsync(async (req,res,next) => {
    let filter = {};
    if(req.params.tourId) filter = {tour: req.params.tourId}

    const features = new APIFeatures(Model.find(filter),req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const doc = await features.query;
    //send response
    res.status(200).json({
    status:'success',
    result:doc.length,
    data :{
        data : doc
    } 
});
    
});