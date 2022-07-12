const express = require("express");
const router = express.Router();
const middleware = require("../middlewares");

const productController = require("../controllers/product");

router.post("/", middleware.login, productController.create);
router.get("/", productController.index);
router.get("/:id", productController.indexById);
router.put("/:id", middleware.login, productController.update);
router.delete("/:id", middleware.login, productController.delete);

router.get("/filter/:category", productController.filter);
router.post("/filter", productController.filterPrice);

module.exports = router;
