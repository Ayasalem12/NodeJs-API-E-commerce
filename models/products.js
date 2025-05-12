const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const productsSchema = new Schema({
    sellerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim : true
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        trim : true
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min:[0,'Price can not be negative']
    },
    stock: {
        type: Number,
        // required: [true, 'Product stock is required'],
        required:false,
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    sold: {
        type: Number,
        min: [0,],
        default: 0,
    },
    image: {
        type: String,
        required: [false, 'Product image URL is required'], 
    },
    
}, {
    timestamps: true, 
});

const productsModel = model('Product', productsSchema);
module.exports = productsModel;