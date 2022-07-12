const express = require("express");
const router = express.Router();

const userController = require("../controllers/user");

router.get("/:id", userController.showUser);
router.get("/", userController.index);
router.post("/", userController.register);

module.exports = router;
