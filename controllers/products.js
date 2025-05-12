
const mongoose = require('mongoose');
const usersModel = require('../Models/users');
const productsModel = require('../Models/products');
const { catchAsync } = require('../utils/catchAsync');
const AppError = require('../utils/ApiError');
const { create, update, delete: deleteProduct, getOne, getAll } = require('../services/handlersFactory');

// GET /products
exports.getAll = getAll(productsModel);

// GET /products/:id
exports.getById = getOne(productsModel);
// GET /users/:userId/products
exports.getByUserId = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(new AppError(400, 'Invalid User ID format'));
    }

    const userExists = await usersModel.findById(userId);
    if (!userExists) {
        return next(new AppError(404, 'User not found'));
    }

    const products = await productsModel.find({ sellerId: userId });
    res.status(200).json({ message: 'Success get user his products', data: products });
});

// POST /products
exports.save = catchAsync(async (req, res, next) => {
    // const { name, description, price, image } = req.validatedBody;
    const userId = req.id;

    const userExists = await usersModel.findById(userId);
    if (!userExists) {
        return next(new AppError(404, 'User not found'));
    }

    req.body.sellerId = userId; // Set sellerId for the factory
    return create(productsModel)(req, res, next);
});

// PATCH /products/:id
exports.update = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    // const { name, description, price, image } = req.validatedBody;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, 'Invalid ID format'));
    }

    const product = await productsModel.findById(id);
    if (!product) {
        return next(new AppError(404, 'Product not found'));
    }

    if (product.sellerId.toString() !== req.id) {
        return next(new AppError(403, 'You can only update your own products'));
    }

    return update(productsModel)(req, res, next);
});

// DELETE /products/:id
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, 'Invalid ID format'));
    }

    const product = await productsModel.findById(id);
    if (!product) {
        return next(new AppError(404, 'Product not found'));
    }

    if (product.sellerId.toString() !== req.id) {
        return next(new AppError(403, 'You can only delete your own products'));
    }

    return deleteProduct(productsModel)(req, res, next);
});

// GET /products/search
exports.searchProducts = catchAsync(async (req, res, next) => {
    if (!req.id) {
        return next(new AppError(401, 'You must be logged in to search'));
    }

    const { keyword } = req.query;
    if (!keyword) {
        return next(new AppError(400, 'Search keyword is required'));
    }

    const products = await productsModel.find({
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { 'sellerId.username': { $regex: keyword, $options: 'i' } }
        ]
    }).populate('sellerId', 'username');

    res.status(200).json({ message: 'Search results', data: products });
});

// exports.getAll = catchAsync(async (req, res, next) => {
//      let { limit, skip, render } = req.params;
    
//         if (limit) {
//             limit = parseInt(limit);
//             if (isNaN(limit) || limit < 1) {
//                 return next(new AppError(400, 'Limit must be a positive integer'));
//             }
//         }
//         if (skip) {
//             skip = parseInt(skip);
//             if (isNaN(skip) || skip < 0) {
//                 return next(new AppError(400, 'Skip must be a non-negative integer'));
//             }
//         }
    
//         if (render && !['true', 'false'].includes(render)) {
//             return next(new AppError(400, 'Render must be either "true" or "false"'));
//         }
    
//         let products;
//         if (!limit || !skip) {
//             products = await productsModel.find().populate('userId');
//         } else {
//             products = await productsModel.find().limit(limit).skip(skip).populate('userId');
//         }
    
//         if (render === 'true') {
//             return res.render('product', { products });
//         } else {
//             return res.status(200).json({ message: 'Success get data', data: products });
//         }
// })

// // GET /products/:id
// exports.getById = catchAsync(async (req, res, next) => {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     let product = await productsModel.findById(id);
//     if (!product) {
//         return next(new AppError(404, 'This is id not found'));
//     }
//     res.status(200).json({ message: 'Success get data', data: product });
// });

// // GET /users/:userId/products
// exports.getByUserId = catchAsync(async (req, res, next) => {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return next(new AppError(400, 'Invalid User ID format'));
//     }

//     const userExists = await usersModel.findById(userId);
//     if (!userExists) {
//         return next(new AppError(404, 'User not found'));
//     }

//     const products = await productsModel.find({ userId });
//     res.status(200).json({ message: 'Success get user his products', data: products });
// });

// // POST /products
// exports.save = catchAsync(async (req, res, next) => {
//     const { name, description,price,image } = req.validatedBody;
//     const userId = req.id; 
//     // Check if user exists
//     const userExists = await usersModel.findById(userId);
//     if (!userExists) {
//         return next(new AppError(404, 'User not found'));
//     }

//     let product = await productsModel.create({ name,description,price,image,userId });
//     res.status(201).json({ message: 'Success create data', data: product });
// });

// // PATCH /products/:id - Update product (for sellers only)
// exports.update = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
//     const { name, description, price,image } = req.validatedBody;
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     let product = await productsModel.findById(id);
//     if (!product) {
//         return next(new AppError(404, 'Product not found'));
//     }

//     if (product.userId.toString() !== req.id) {
//         return next(new AppError(403, 'You can only update your own products'));
//     }

//     const updateData = {};
//     if (name) updateData.name = name;
//     if (description) updateData.description = description;
//     if (price) updateData.price = price;
//     if (image) updateData.image = image;

//     product = await productsModel.findByIdAndUpdate(id, updateData, { new: true }).populate('userId', 'username');
//     res.status(200).json({ message: 'Success update product', data: product });
// });

// //Delete products/:id  - Delete product (for sellers only)

// exports.deleteProduct = catchAsync(async (req, res, next) => {
//     const { id } = req.params;
    
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return next(new AppError(400, 'Invalid ID format'));
//     }

//     let product = await productsModel.findById(id);
//     if (!product) {
//         return next(new AppError(404, 'Product not found'));
//     }

//     if (product.seller.toString() !== req.id) {
//         return next(new AppError(403, 'You can only delete your own products'));
//     }
//     product = await productsModel.findByIdAndDelete(product);
//     res.status(200).json({ message: 'Success delete product'});
// });
