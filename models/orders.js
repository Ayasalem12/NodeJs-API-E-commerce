const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const ordersSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
        required: [true, 'User ID is required'],
    },
    items: [{
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
    totalPrice: {
        type: Number,
        required: [true, 'Total price is required'],
        min: [0, 'Total price cannot be negative'],
    },
    order_date:{
        type: Date
    },
}, {
    timestamps: true, 
});

const ordersModel = model('Orders', ordersSchema);
module.exports = ordersModel;