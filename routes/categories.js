const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/category");

router.get("/", categoryController.getAllCategory);

router.get('/p/:category', categoryController.getProductByCategory);

router.post('/', categoryController.createCategory);

router.put('/:id', categoryController.updateCategory);

router.delete('/:id', categoryController.deleteCategory);

router.get('/:id', categoryController.getCategory);

module.exports = router;
