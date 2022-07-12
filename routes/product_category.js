const express = require("express");
const router = express.Router();

const productCategory = require("../controllers/product_category");

router.get("/", productCategory.index);
router.post("/", productCategory.create);

module.exports = router;
