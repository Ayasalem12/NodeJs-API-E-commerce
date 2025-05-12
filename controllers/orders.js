

const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const cartModel = require('../Models/cart');
const usersModel = require('../Models/users');
const productsModel = require('../Models/products');
const ordersModel = require('../models/orders');

const { getAll, getOne, delete: deleteOne } = require('../services/handlersFactory');

// POST /orders
exports.createCashOrder = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const {cartId} = req.params;
    const shippingPrice = 0;
    const cart = await cartModel.findById(cartId);

    if (!cart || cart.products.length === 0) {
        return next(new ApiError(400, 'Cart is empty'));
    }
    
    // const items = cart.products.map(item => ({
    //     product: item.product,
    //     quantity: item.quantity
    // }));

    // for (let item of items) {
    //     const product = await productsModel.findById(item.product);
    //     if (!product || product.stock < item.quantity) {
    //         return next(new ApiError(400, `Insufficient stock for product ${product.name}`));
    //     }
    //     product.stock -= item.quantity;
    //     await product.save();
    // }
    const cartPrice = cart.totalCartPrice;
    const totalOrderPrice = cartPrice  + shippingPrice;
    const order = await ordersModel.create({
        userId,
        cartItems: cart.cartItems,
        // items,
        totalOrderPrice,
        // shippingAddress: req.body.shippingAddress,
        paymentMethod: 'cash_on_delivery',
        status: 'pending'
    });
    if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
      
    }));
    await productsModel.bulkWrite(bulkOption,{});
    await cartModel.findByIdAndDelete(cartId);
   }

    res.status(201).json({ message: 'Order created successfully', data: order });
});

exports.filterOrderForLoggedUser = catchAsync(async (req, res, next) => {
  if (req.role === 'user') req.filterObj = { user: req.id };
  next();
});
// GET /orders
exports.getAllOrders = getAll(ordersModel);

// GET /orders/:id
exports.getOneOrderSpecific = getOne(ordersModel);

// DELETE /orders/:id
exports.deleteOrder = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid ID format'));
    }

    const order = await ordersModel.findById(id);
    if (!order) {
        return next(new ApiError(404, 'Order not found'));
    }

    if (order.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new ApiError(403, 'You can only delete your own orders'));
    }

    return deleteOne(ordersModel)(req, res, next);
});

// GET /orders/user
exports.getUserOrders = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const orders = await ordersModel.find({ userId }).populate('items.product');
    res.status(200).json({ message: 'User orders', data: orders });
});
// Update order paid status to paid
exports.updateOrderToPaid = catchAsync(async (req, res, next) => {
  const {orderId}=req.params
  const order = await ordersModel.findById(orderId);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${orderId}`,
        404
      )
    );
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

exports.updateOrderToDelivered = catchAsync(async (req, res, next) => {
    const {orderId}=req.params
  const order = await ordersModel.findById(orderId);
  if (!order) {
    return next(
      new ApiError(
        `There is no such a order with this id:${orderId}`,
        404
      )
    );
  }

  // update order to deliverd
  order.status = 'delivered';

  const updatedOrder = await order.save();

  res.status(200).json({ status: 'success', data: updatedOrder });
});

  // 3) Create stripe checkout session
exports.checkoutSession = catchAsync(async (req, res, next) => {
  // app settings
  const shippingPrice = 0;

  // 1) Get cart depend on cartId
  const cart = await cartModel.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(`There is no such cart with id ${req.params.cartId}`, 404)
    );
  }

  // 2) Get order price depend on cart price "Check if coupon apply"
  const cartPrice = cart.totalCartPrice

  const totalOrderPrice = cartPrice + shippingPrice;

  // 3) Create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        name: req.user.name,
        amount: totalOrderPrice * 100,
        currency: 'egp',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${req.protocol}://${req.get('host')}/orders`,
    cancel_url: `${req.protocol}://${req.get('host')}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  // 4) send session to response
  res.status(200).json({ status: 'success', session });
});


