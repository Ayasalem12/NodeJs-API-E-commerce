// validation/todos.validation.js
const Joi = require('joi');
const mongoose = require('mongoose');

const createProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(20).required().messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 20 characters',
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    description: Joi.string().messages({
        'any.only': 'Description is required ',
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
    }),
    price: Joi.number().messages({
        'any.only': 'Product price is required ',
        'string.empty': 'price is required',
        'any.required': 'price is required',
    }),
    stock: Joi.number().messages({
        'any.only': 'stock is required ',
        'string.empty': 'stock is required',
        'any.required': 'stock is required',
    }),
    sold: Joi.number().default(0)
    
}).options({ stripUnknown: true }); // This line removes unknown fields silently;

const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(3).max(20).required().messages({
        'string.min': 'Title must be at least 5 characters',
        'string.max': 'Title cannot exceed 20 characters',
        'string.empty': 'Title is required',
        'any.required': 'Title is required',
    }),
    description: Joi.string().messages({
        'any.only': 'Description is required ',
        'string.empty': 'Description is required',
        'any.required': 'Description is required',
    }),
    price: Joi.number().messages({
        'any.only': 'Product price is required ',
        'string.empty': 'price is required',
        'any.required': 'price is required',
    }),
    stock: Joi.number().messages({
        'any.only': 'stock is required ',
        'string.empty': 'stock is required',
        'any.required': 'stock is required',
    }),
    sold: Joi.number().default(0),
    
}).options({ stripUnknown: true }); // This line removes unknown fields silently;

module.exports = { createProductSchema, updateProductSchema };