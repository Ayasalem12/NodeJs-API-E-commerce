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
} = require('../controllers/cart')



router.post('/addCart',addItemToCart,auth, restrictTo('user','admin'))
router.get('/:id/getCart',getLoggedUserCart,auth, restrictTo('user','admin'))

router.delete('/:id/delete',deleteCart,auth, restrictTo('user','admin'));

router.put('/:productId',updateCartItemQuantity,auth, restrictTo('user','admin'))
router.delete('/:productId',removeProductFromCart,auth, restrictTo('user','admin'));

module.exports = router;
