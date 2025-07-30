const Joi = require('joi');

const registerSchema = Joi.object({
    username: Joi.string().trim().required().messages({
        'string.empty': 'Username is required',
        'any.required': 'Username is required',
    }),
    role: Joi.string().valid('user', 'admin','seller').insensitive().default('user').messages({
        'any.only': 'Role must be either "user" or "admin" or "seller"',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email is required',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password is required',
        'any.required': 'Password is required',
    }),
});

module.exports = registerSchema;