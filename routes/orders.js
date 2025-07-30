const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const {
    createCashOrder,
    getAllOrders,
    getOneOrderSpecific,
    deleteOrder,
    getUserOrders,
    updateOrderToPaid,
    updateOrderToDelivered,
    checkoutSession
} = require ("../controllers/orders");

router.get('/checkout-session/:cartId',auth,restrictTo('user'),checkoutSession);
router.post('/:cartId',auth,restrictTo('user'),createCashOrder);
router.get('/',auth,restrictTo('user','admin'),getAllOrders);
router.get('/:userId',auth,restrictTo('user','admin'),getUserOrders);
router.delete('/:id',auth,restrictTo('admin'),deleteOrder);
router.get('/:id',auth,restrictTo('admin','user'),getOneOrderSpecific);
router.put('/:orderId/pay',auth,restrictTo('admin'),updateOrderToPaid);
router.put('/:orderId/delivered',auth,restrictTo('admin'),updateOrderToDelivered);
