const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const { Schema, model } = mongoose;

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minlength: [8, 'Username must be at least 8 characters'],
    },
    role:{
        type:String,
        enum: ['user', 'admin','seller'],
        default: 'user',
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    passwordChangedAt: {type: Date},
    passwordResetCode: {type:String},
    passwordResetExpires: {type:Date},
    passwordResetVerified: {type:Boolean},
}, {
    timestamps: true, 
});
userSchema.pre("save",async function(next){
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(this.password, salt);
    this.password = hashedPassword;
    next();
})
const usersModel = model('User', userSchema);
module.exports = usersModel;