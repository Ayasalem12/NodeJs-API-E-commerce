const asyncHandler = require('express-async-handler'); //Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.
const express = require('express');
const ApiError = require ('../utils/ApiError');
const ApiFeatures = require('./apiFeaturesapiFeatures')
exports.delete = (Model) =>
    asyncHandler(async (req , res ,next)=>{
        const {id} = req.params
        const data = await Model.findByIdAndDelete(id)
        if(!data) {
            return next(new ApiError('No data found with this id', 404))
        }
        data.remove()
        res.status(204).json({message: 'Data deleted successfully'})
    }
);

exports.update = (Model) =>
    asyncHandler(async (req, res, next) =>
        {
            const {id} = req.params 
            const data = await Model.findByIdAndUpdate(id, req.body, {new: true})
            if(!data) {
                return next(new ApiError('No data found with this id', 404))
            }
            data.save();
            res.status(204).json({message: 'Data updated successfully', data:data})
        }
)
exports.create = (Model)=>
    asyncHandler(async (req, res, next) =>
        {
            const data = await Model.create(req.body)
            res.status(201).json({message: 'Data created successfully', data:data})
        }
)
exports.getOne = (Model,populationOpt) =>
    asyncHandler(async (req, res, next) =>
        {
            const {id} = req.params
            const data = await Model.findById(id)
            if(populationOpt){
                data = await data.populate(populationOpt)
                // data = await data.populate(populationOpt).execPopulate()
            }
            if(!data) {
                return next(new ApiError('No data found with this id', 404))
            }
            res.status(200).json({message: 'Data found successfully', data:data})
        }
)
exports.getAll = (Model,modelName ='') =>
    asyncHandler(async (req, res, next) =>
        {
            let filters = {}
            if(req.filter){
                filters = req.filter
            }
            const documentsCounts = await Model.countDocuments();
            const apiFeatures = new ApiFeatures(Model.find(filter),req.query)
            .paginate(documentsCounts)
            .filter()
            .search(modelName)
            .limitFields()
            .sort();
            //execute query
            const { mongooseQuery, paginationResult } = apiFeatures;
            const documents = await mongooseQuery;
            res.status(200).json({message: 'Data found successfully', data:documents,paginationResult, data: documents })
        }
    );