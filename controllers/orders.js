

const mongoose = require('mongoose');
const cartModel = require('../Models/cart');
const usersModel = require('../Models/users');
const productsModel = require('../Models/products');
const ordersModel = require('../Models/orders');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { getAll, getOne, delete: deleteOne } = require('../services/handlersFactory');

// POST /orders
exports.createOrder = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const cart = await cartModel.findOne({ userId });

    if (!cart || cart.products.length === 0) {
        return next(new AppError(400, 'Cart is empty'));
    }

    const items = cart.products.map(item => ({
        product: item.productId,
        quantity: item.quantity
    }));

    for (let item of items) {
        const product = await productsModel.findById(item.product);
        if (!product || product.stock < item.quantity) {
            return next(new AppError(400, `Insufficient stock for product ${product.name}`));
        }
        product.stock -= item.quantity;
        await product.save();
    }

    const order = await ordersModel.create({
        userId,
        items,
        totalPrice: cart.totalPrice,
        paymentMethod: 'cash_on_delivery',
        status: 'pending'
    });

    await cartModel.deleteOne({ userId });

    res.status(201).json({ message: 'Order created successfully', data: order });
});

// GET /orders
exports.getAll = getAll(ordersModel);

// GET /orders/:id
exports.getOne = getOne(ordersModel);

// DELETE /orders/:id
exports.deleteOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, 'Invalid ID format'));
    }

    const order = await ordersModel.findById(id);
    if (!order) {
        return next(new AppError(404, 'Order not found'));
    }

    if (order.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new AppError(403, 'You can only delete your own orders'));
    }

    return deleteOne(ordersModel)(req, res, next);
});

// GET /orders/user
exports.getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const orders = await ordersModel.find({ userId }).populate('items.product');
    res.status(200).json({ message: 'User orders', data: orders });
});