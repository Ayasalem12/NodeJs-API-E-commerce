const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const usersModel = require('../Models/users');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/ApiError');
const { create, update, delete: deleteOne, getOne, getAll } = require('../services/handlersFactory');

// POST /users
exports.save = create(usersModel);

// exports.save = catchAsync(async (req, res, next) => {
//     const { role } = req.validatedBody;
//     if (role === 'admin' && (!req.role || req.role !== 'admin')) {
//         return next(new AppError(403, 'Only admins can register admin users'));
//     }
//     return create(usersModel)(req, res, next);
// });

// GET /users
exports.getAll = getAll(usersModel);

// GET /users/:id
exports.getById = getOne(usersModel);

// PATCH /users/:id
exports.update = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { username, role, email, password } = req.validatedBody;

    if (role && req.role !== 'admin') {
        return next(new AppError(403, 'Only admins can change roles'));
    }

    if (password) {
        const salt = await bcryptjs.genSalt(10);
        req.body.password = await bcryptjs.hash(password, salt);
    }

    return update(usersModel)(req, res, next);
});

// DELETE /users/:id
exports.deleteUser = deleteOne(usersModel);

// POST /users/login
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.validatedBody;

    const user = await usersModel.findOne({ email });
    if (!user) {
        return next(new AppError(404, 'User not found'));
    }

    const isValidPassword = await bcryptjs.compare(password, user.password);
    if (!isValidPassword) {
        return next(new AppError(400, 'Invalid password'));
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1d' });
    res.status(200).json({ message: 'User logged in successfully', data: { token } });
});






















// const bcryptjs = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const usersModel = require('../Models/users');
// const {catchAsync} = require('../utils/catchAsync');
// const AppError = require('../utils/ApiError');

// // POST /users
// exports.save = catchAsync(async (req, res, next) => {
//     const { username, email, password, role } = req.validatedBody;

//     if (role === 'admin' && (!req.role || req.role !== 'admin')) {
//         return next(new AppError(403, 'Only admins can register admin users'));
//     }

//     let user = await usersModel.create({ username, email, password, role });
//     res.status(201).json({ message: 'Success create new user', data: user });
// });

// // GET /users
// exports.getAll = catchAsync(async (req, res, next) => {
//     let users = await usersModel.find().select('-password');
//     if (!users || users.length === 0) {
//         return next(new AppError(404, 'No users found'));
//     }
//     res.status(200).json({ message: 'Success get all users', data: users });
// });

// // GET /users/:id
// exports.getById = catchAsync(async (req, res, next) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     let user = await usersModel.findById(id).select('-password');
//     if (!user) {
//         return next(new AppError(404, 'User not found'));
//     }

//     res.status(200).json({ message: 'Success to get user data', data: user });
// });

// // PATCH /users/:id
// exports.update = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const { username,role, email, password } = req.validatedBody;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     const updateData = {};
//     if (username) updateData.username = username;
//     if (email) updateData.email = email;
//     if (role) updateData.role = role;
//     if (password) {
//         const salt = await bcryptjs.genSalt(10);
//         updateData.password = await bcryptjs.hash(password, salt);
//     }

//     let user = await usersModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select('-password');
//     if (!user) {
//         return next(new AppError(404, 'User not found'));
//     }

//     res.status(200).json({ message: 'User was edited successfully', data: user });
// });

// // DELETE /users/:id
// exports.deleteUser = catchAsync(async (req, res, next) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     let user = await usersModel.findByIdAndDelete(id);
//     if (!user) {
//         return next(new AppError(404, 'User not found'));
//     }

//     res.status(200).json({ message: 'Success to delete user' });
// });

// // POST /users/login
// exports.login = catchAsync(async (req, res, next) => {
//     const { email, password } = req.validatedBody;

//     const user = await usersModel.findOne({ email });
//     if (!user) {
//         return next(new AppError(404, 'User not found'));
//     }

//     const isValidPassword = await bcryptjs.compare(password, user.password);
//     if (!isValidPassword) {
//         return next(new AppError(400, 'Invalid password'));
//     }

//     const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1d' });
//     res.status(200).json({ message: 'User logged in successfully', data: { token } });
// });