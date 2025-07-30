const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const {
    addItemToCart,
    getLoggedUserCart,
    deleteCart,
    removeProductFromCart,
    // clearCart,
    updateCartItemQuantity
} = require('../controllers/cart');


// const { validation } = require('../middleware/validation');


router.post('/addCart', auth, restrictTo('user','admin'), addItemToCart);
router.get('/:id/getCart', auth, restrictTo('user','admin'), getLoggedUserCart);
router.delete('/:id/delete', auth, restrictTo('user','admin'), deleteCart);
router.put('/:productId', auth, restrictTo('user','admin'), updateCartItemQuantity);
// router.delete('/:productId', auth, restrictTo('user','admin'), removeProductFromCart);
router.delete('/delete-product-from-cart', auth, restrictTo('user','admin'), removeProductFromCart);

module.exports = router;
