const express = require("express");
const router = express.Router();

const mediaController = require("../controllers/mediaController");
const upload = require('../middlewares/upload')

router.post("/avatar", upload.single('avatar'), mediaController.imageUpload);
router.post("/product-photos", upload.array('photos', 3), mediaController.imageMulti);

module.exports = router;
