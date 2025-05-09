// validation/users.validation.js
const Joi = require('joi');

const updateUserSchema = Joi.object({
    username: Joi.string().trim().optional().messages({
        'string.empty': 'Username cannot be empty',
    }),
    role: Joi.string().valid('user', 'admin').insensitive().default('user').optional().messages({
        'any.only': 'Role must be either "user" or "admin"',
    }),
    email: Joi.string().email().optional().messages({
        'string.email': 'Email must be a valid email address',
        'string.empty': 'Email cannot be empty',
    }),
    password: Joi.string().min(6).optional().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password cannot be empty',
    }),
});

module.exports = { updateUserSchema };