const express = require("express");
const router = express.Router();

const authRoute = require("./auth");
const userRoute = require("./user");
const mediaRoute = require('./media')
const categoryRoutes = require("./categories");
const productRoute = require("./product");
const productCategoryRoute = require("./product_category");
const transactionRoute = require('./transaction')

router.use("/v1/uploads", mediaRoute);
const favoriteRoute = require('./favorite');
const passport = require('../lib/passport');
const authMiddleware = require('../middlewares/auth')

router.use(passport.initialize());
router.use("/v1/auth", authRoute);
router.use("/v1/user", userRoute);
router.use("/v1/product", productRoute);
router.use("/v1/product_categories", productCategoryRoute);

router.use('/v1/categories', categoryRoutes);
router.use('/v1/favorite', authMiddleware, favoriteRoute);

router.use('/v1/transaction', transactionRoute)

module.exports = router;
