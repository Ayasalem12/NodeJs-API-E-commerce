const mongoose = require('mongoose')
const cartModel = require('../Models/cart')
const usersModel = require('../Models/users')
const productsModel = require('../Models/products')
const {catchAsync} = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { delete: deleteOne, getOne } = require('../services/handlersFactory');

const calcTotalpriceCart = (cart) =>{
    let totalPrice = 0;
    cart.products.forEach((product) =>{
        // totalPrice +=product.quantity * product.price
        totalPrice = cart.products.reduce((acc, item) => acc + item.price * item.quantity, 0);

    });
    cart.totalCartPrice = totalPrice;
    return totalPrice

}
exports.addItemToCart = catchAsync( async (req,res,next) =>{
    const userId = req.id;
    // const {productId,name, description,price,image,quantity } = req.validatedBody;
    const {productId,name, description,price,image,quantity } = req.body;
    if(!userId){
        return next(new ApiError(404,'User not found'));
    }
    if (!productId){
        return next(new ApiError(400, 'Invalid product'));
    }
    let productAvailable = await productsModel?.findOne({_id: productId});
      console.log(productAvailable);
    if (!productAvailable) {
        return next(new ApiError(404, 'Product not found'));
    }
    if (productAvailable.stock < quantity) {
        return next(new ApiError(400, 'Out of stock'));
    }
    productAvailable.stock -= quantity;
    productAvailable.sold += quantity;
await productAvailable.save();

    if(quantity <= 0){
        return next(new ApiError(400, 'Invalid quantity'))
    }
    let cart =  await cartModel.findOne({ userId: userId });

    if(cart){
        let itemIndex = cart.products.findIndex((p) => p.product.toString() == productId)
        if(itemIndex > -1){
            cart.products[itemIndex].quantity += quantity;
        }else{
            cart.products.push({ product: productId, name:name,quantity: quantity, description: description, image: image, price: price })
        }
        calcTotalpriceCart(cart);
        cart = await cart.save();
        return res.status(200).json({ message: "Updated Cart Successfully!", updatedCart: cart });
    }else{
        const newCart = await cartModel.create({
            userId,
            products: [{
              product: productId,
              name: name,
              quantity: quantity,
              description: description,
              image: image,
              price: price
            }],
            totalCartPrice: quantity * price
          });
          return res.status(200).json({ message: "Created New Cart Successfully!", numOfCartProducts: newCart.products.length,newCart: newCart });
    }
    

}

)
// GET /carts/:id
exports.getLoggedUserCart = catchAsync(async (req, res, next) => {
    const {id} = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400,'Invalid ID format'));
    }

    const cart = await cartModel.findById(id);
    if (!cart) {
        return next(new ApiError(404,'Cart not found'));
    }

    if (cart.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new ApiError(403, 'You can only view your own cart'));
    }

    return getOne(cartModel)(req, res, next);
});
// DELETE /carts/:id
exports.deleteCart = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new ApiError(400, 'Invalid ID format'));
    }

    const cart = await cartModel.findById(id);
    if (!cart) {
        return next(new ApiError(404, 'Cart not found'));
    }

    if (cart.userId.toString() !== req.id && req.role !== 'admin') {
        return next(new ApiError(403, 'You can only delete your own cart'));
    }

    return deleteOne(cartModel)(req, res, next);
});

// remove specific product from cart
exports.removeProductFromCart = catchAsync(async (req, res, next) => {
    const userId = req.id;
    const { productId } = req.body;
  
    const cart = await cartModel.findOne({ userId });
    if (!cart) return next(new ApiError(404, 'Cart not found'));
  
    const itemIndex = cart.products.findIndex(
      (p) => p.product.toString() === productId
    );
  
    if (itemIndex === -1) return next(new ApiError(404, 'Product not in cart'));
  
    const removedProduct = cart.products[itemIndex];
    // const removedQuantity = removedItem.quantity;
    // const removedPrice = removedItem.price;
  
    // Increase stock
    await productsModel.findByIdAndUpdate(productId, {
      $inc: { stock: removedProduct.quantity,sold: -removedProduct.quantity },
    });
  
    // Remove from cart
    cart.products.splice(itemIndex, 1);

    calcTotalpriceCart(cart);
    await cart.save();

    const product = await productsModel.findById(productId);
  if (product) {
    product.stock +=  removedProduct.quantity;
    product.sold = Math.max((product.sold || 0) -  removedProduct.quantity, 0); 
    await product.save();
  }
    return res.status(200).json({ message: 'Item removed from cart', cart });
  });
  

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
