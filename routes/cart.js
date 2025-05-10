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

router.use(auth, restrictTo('user','admin'));

router
   .post(addItemToCart)
   .get(getLoggedUserCart)
   .delete(deleteCart);
router
  .route('/:productId')
  .put(updateCartItemQuantity)
  .delete(removeProductFromCart);

module.exports = router;
