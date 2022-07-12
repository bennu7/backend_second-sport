const express = require("express");
const router = express.Router();
const middleware = require("../middlewares");

const transactionController = require("../controllers/transaction");

router.get("/", transactionController.index);
router.get("/:id", transactionController.indexById);
router.post("/", middleware.login, transactionController.create);

module.exports = router;
