const express = require('express');
const router = express.Router();
const { save, getAll, getById, deleteUser, update, login } = require('../controllers/users');
// const { getByUserId } = require('../controller/todos');
const { auth, restrictTo } = require('../middleware/auth');
const { validation } = require('../middleware/validation');
const registerSchema = require('../validation/register.validation');
const loginSchema = require('../validation/login.validation');
const { updateUserSchema } = require('../validation/updateUser.validation');
// POST /users - Register a user
router.post('/register', validation(registerSchema), save);

// POST /users/login - Login a user
router.post('/login', validation(loginSchema), login);

// GET /users - Get all users
router.get('/', getAll);

// GET /users/:id - Get a user by ID (admin only)
router.get('/:id', auth, restrictTo('admin'), getById);

// DELETE /users/:id - Delete a user (admin only)
router.delete('/:id', auth, restrictTo('admin'), deleteUser);

// PATCH /users/:id - Update a user
router.patch('/:id', validation(updateUserSchema), update);



module.exports = router;