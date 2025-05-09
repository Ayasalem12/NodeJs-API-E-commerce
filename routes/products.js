const express = require('express');
const router = express.Router();
const { auth, restrictTo } = require('../middleware/auth');
const { validation } = require('../middleware/validation');
const { createProductSchema, updateProductSchema } = require('../validation/product.validation')
const {getById,getByUserId,save,update,deleteProduct,getAll} = require('../controllers/products');

// POST /products - Create Product 
router.post('/create-product', validation(createProductSchema), save);

// GET /products - Get all users
router.get('/',auth,getAll);

// GET /product/:id 
router.get('/:id',getById);
// GET /product/:id (seller created it)
router.get('/:userId/:id',auth, restrictTo('admin','seller'),getByUserId);

// DELETE /product/:id - Delete a product (admin or seller)
router.delete('/:id', auth, restrictTo('admin','seller'), deleteProduct);

// PATCH /product/:id - Update a product (admin or seller)
router.patch('/:id',auth, restrictTo('admin','seller'),validation(updateProductSchema), update);

module.exports = router;