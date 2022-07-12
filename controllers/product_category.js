const { ProductCategory } = require("../models");
const Sentry = require("../lib/sentry");

module.exports = {
  index: async (req, res) => {
    try {
      const data = await ProductCategory.findAll();

      res.sendJson(200, true, "success get all data product category", data);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  create: async (req, res) => {
    try {
      const { product_id, category_id } = req.body;

      const created = await ProductCategory.create({
        product_id,
        category_id,
      });

      res.sendDataCreated("success create new product category", created);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },
};
