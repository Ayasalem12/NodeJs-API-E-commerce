const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordersSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    cartItems: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
    }],
    paymentMethod: {
        type: String,
        enum: ['cash_on_delivery', 'online_payment'],
        default: 'cash_on_delivery',
    },
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled'],
        default: 'pending',
    },
    totalOrderPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
    },
    shippingAddress: {
      details: String,
      phone: String,
      city: String,
      postalCode: String,
    },
    shippingPrice: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {type:Date},
    orderDate:{
        type: Date
    },
}, {
    timestamps: true, 
});

ordersSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'userId',
    select: 'name email role',
  }).populate({
    path: 'cartItems.product',
    select: 'name description',
  });

  next();
});


const ordersModel = model('Order', ordersSchema);
module.exports = ordersModel;