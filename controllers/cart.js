const mongoose = require('mongoose')
const cartModel = require('../Models/cart')
const usersModel = require('../Models/users')
const productsModel = require('../Models/products')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/ApiError');
const { delete: deleteOne, getOne } = require('../services/handlersFactory');

const calcTotalpriceCart = (cart) =>{
    let totalPrice = 0;
    cart.products.forEach((product) =>{
        totalPrice +=product.quantity * product.price
    });
    cart.totalCartPrice = totalPrice;
    return totalPrice

}
exports.addItemToCart = catchAsync( async (req,res,next) =>{
    const userId = req.id;
    const {productId,name, description,price,image,quantity } = req.validatedBody;
    if(!userId){
        return next(new AppError(404,'User not found'));
    }
    if (!productId){
        return next(new AppError(400, 'Invalid product'));
    }
    let productAvailable = await productsModel?.findOne({_id: req.body.productId});
      console.log(productAvailable);
    if (!productAvailable) {
        return next(new AppError(404, 'Product not found'));
    }
    if (productAvailable.stock < quantity) {
        return next(new AppError(400, 'Out of stock'));
    }
    if(quantity == -1 && quantity==0){
        return next(new AppError(400, 'Invalid quantity'))
    }
    const cart =  await cartModel.findOne({ userId: userId });
    if(cart){
        let itemIndex = cart.products.findIndex((product) => product.productId == productId)
        if(itemIndex > -1){
            let productItem = cartModel.products[itemIndex]
            productItem.quantity +=quantity;
            // productItem.price += productItem.quantity * price;
            cart.products[itemIndex]=productItem
        }else{
            cart.products.push({ productId: productId, name:name,quantity: quantity, description: description, image: image, price: price })
        }
        calcTotalpriceCart(cart)
        cart = await cart.save();
        return res.status(200).json({ message: "Updated Cart Successfully!", updatedCart: cart });
    }else{
        const newCart = await cart.create({ productId: productId, name:name,quantity: 1, description: description, image: image, price: price ,userId})
        return res.status(200).json({ message: "Created New Cart Successfully!", numOfCartProducts: cart.products.length,newCart: newCart });
    }
    

}

)
// GET /carts/:id
exports.getLoggedUserCart = catchAsync(async (req, res, next) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400,'Invalid ID format'));
    }

    const cart = await cartModel.findById(id);
    if (!cart) {
        return next(new AppError(404,'Cart not found'));
    }

    if (cart.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new AppError(403, 'You can only view your own cart'));
    }

    return getOne(cartModel)(req, res, next);
});
// DELETE /carts/:id
exports.deleteCart = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError(400, 'Invalid ID format'));
    }

    const cart = await cartModel.findById(id);
    if (!cart) {
        return next(new AppError(404, 'Cart not found'));
    }

    if (cart.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new AppError(403, 'You can only delete your own cart'));
    }

    return deleteOne(cartModel)(req, res, next);
});

// remove specific product from cart
exports.removeProductFromCart = catchAsync(async (req, res, next) =>{
    const {productId} = req.params;
    const userId = req.id;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(new AppError(400, 'Invalid ID format'));
    }
    if(!userId){
        return next(new AppError(404,'User not found'));
    }
    const cart = await cartModel.findOneAndUpdate(
        { user: userId },
        {
        $pull: { products: { _id: productId } },
        },
        { new: true }
    )
    calcTotalpriceCart(cart);
    cart.save();
     return res.status(200).json({ message: "Created New Cart Successfully!", numOfCartProducts: cart.products.length,cart: cart });

})

//clear cart
// exports.clearCart = catchAsync(async (req, res, next) => {
//   const userId = req.id
//   await Cart.findOneAndDelete({userId});
//   res.status(204).json({message:"Clear cart successfully!",cart:[]});
// });
exports.updateCartItemQuantity = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;
  const {productId} = req.params;
  const userId = req.id;
  const cart = await cartModel.findOne({ userId });
  if (!cart) {
    return next(new ApiError(`there is no cart for user ${userId}`, 404));
  }

  const productIndex = cart.products.findIndex(
    (product) => product._id.toString() === productId
  );
  if (productIndex > -1) {
    const cartProduct = cart.products[productIndex];
    cartProduct.quantity = quantity;
    cart.products[productIndex] = cartProduct;
  } else {
    return next(
      new ApiError(`there is no product for this id :${productId}`, 404)
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartproducts: cart.products.length,
    data: cart,
  });
});
