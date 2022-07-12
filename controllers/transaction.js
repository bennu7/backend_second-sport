const { Transaction, Product } = require("../models");
const Sentry = require("../lib/sentry");
const Validator = require("fastest-validator");
const V = new Validator();

module.exports = {
  index: async (req, res) => {
    try {
      const data = await Transaction.findAll({
        order: [["id", "DESC"]],
      });

      return res.sendJson(200, true, "success get all data transaction", data);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  indexById: async (req, res) => {
    try {
      const id = req.params.id;

      const findData = await Transaction.findOne({
        where: {
          id: id,
        },
      });

      if (!findData) {
        return res.sendNotFound("data transaction not found");
      }

      res.sendJson(200, true, "success get data transaction", findData);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  create: async (req, res) => {
    try {
      console.log(req.body);
      const currentUser = req.user;
      const schema = {
        product_id: "number|required",
      };

      const validator = V.validate(req.body, schema);
      if (validator.length) {
        return res.sendBadRequest("bad request schema");
      }

      //* check available product data
      const checkProduct = await Product.findOne({
        where: {
          id: req.body.product_id,
        },
      });

      if (!checkProduct) {
        return res.sendNotFound("data product not found");
      }

      const created = await Transaction.create({
        user_id: currentUser.id,
        ...req.body,
      });

      return res.sendDataCreated("success create data transaction", created);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },
};
