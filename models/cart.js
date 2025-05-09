const mongoose = require('mongoose');

const cartItemSchema  = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
      quantity: {
        type: Number,
        default: 0,
      },
      image:{
        type: String
      },
      price:{
        type: Number
      }
});
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    products: [cartItemSchema],
    __v: { type: Number, select: false },
    // products: [{
    //     product: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'Product',
    //         required: true,
    //     },
    //     quantity: {
    //         type: Number,
    //         required: true,
    //         min: 1,
    //     },
    // }],
    totalPrice: {  
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
    },
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);