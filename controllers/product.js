const {
  Product,
  Category,
  ProductCategory,
  Transaction,
} = require("../models");
const Sentry = require("../lib/sentry");
const Validator = require("fastest-validator");
const V = new Validator();
const { QueryTypes, Op } = require("sequelize");
const db = require("../models");

module.exports = {
  create: async (req, res) => {
    try {
      // check every user have max 4 product
      // const user_id = req.body.user_id;
      const currentUser = req.user;

      console.log("user auhenticated => ", currentUser);

      const checkCountProduct = await db.sequelize.query(
        `
          SELECT COUNT(*)  
          FROM "Products"
          where user_id=${currentUser.id};
        `,
        {
          type: QueryTypes.SELECT,
        }
      );

      if (checkCountProduct[0].count >= 4) {
        return res.sendBadRequest("user can have max 4 new product");
      }

      const schema = {
        name: { type: "string" },
        status: { type: "boolean" },
        price: { type: "number" },
        description: { type: "string", min: 25, max: 255 },
        product_image_id: { type: "number", optional: true },
      };

      const validator = V.validate(req.body, schema);
      if (validator.length) {
        return res.sendBadRequest("bad request schema");
      }

      if (req.body.user_id) {
      }

      const newProduct = await Product.create({
        ...req.body,
        user_id: currentUser.id,
      });

      res.sendDataCreated("success created new product", newProduct);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  index: async (req, res) => {
    try {
      if (req.query.search) {
        const search = req.query.search;

        const searched = await Product.findAll({
          where: {
            name: {
              [Op.like]: `%${search}%`,
            },
            include: [{ model: Transaction, as: "transactions" }],
          },
        });

        return res.sendJson(200, true, "success search data", searched);
      }

      if (req.query.page) {
        return new Promise(async (resolve, reject) => {
          try {
            const page = parseInt(req.query.page);
            const limit = 5;

            const startIndex = (page - 1) * limit;

            console.log("start index =>", startIndex);

            // *NOTE: is this function same
            // const result = await db.sequelize.query(
            //   `
            //     SELECT * from "Products" OFFSET ${startIndex}
            //     ROW LIMIT ${limit};
            //   `,
            //   {
            //     type: QueryTypes.SELECT,
            //   }
            // );

            const result = await Product.findAndCountAll({
              limit: limit,
              offset: startIndex,
            });

            return resolve(
              res.sendJson(200, true, "success get data all product", result)
            );
          } catch (err) {
            return reject(err);
          }
        });
      }

      const data = await Product.findAll({
        order: [["id", "DESC"]],
      });

      //* NOTE: use is this if want get data by DESC
      // where: {
      //   user_id: 1,
      // },
      // order: [[`"updatedAt"`, "DESC"]],

      res.sendJson(200, true, "success get data all product", data);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  indexById: async (req, res) => {
    try {
      const product_id = req.params.id;

      const product = await Product.findOne({
        where: {
          id: product_id,
        },
        include: [{ model: Transaction, as: "transactions" }],
      });

      if (!product) {
        return res.sendNotFound("id data product not found");
      }

      return res.sendJson(200, true, "success get data product", product);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  filter: async (req, res) => {
    try {
      const name_category = req.params.category;

      const category = await Category.findAll({
        where: {
          name_category: name_category,
        },
        include: [{ model: Product, as: "products" }],
      });

      res.sendJson(200, true, "Success get data", category);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  filterPrice: async (req, res) => {
    try {
      const { price, to_price } = req.body;

      const checkPrice = await db.sequelize.query(
        `
      SELECT * FROM "Products" WHERE price >= ${price} 
      AND price <= ${to_price}
      `,
        {
          type: QueryTypes.SELECT,
        }
      );

      res.sendJson(200, true, "Success get data by price", checkPrice);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  update: async (req, res) => {
    try {
      const currentUser = req.user;
      const product_id = req.params.id;

      const checkOwnerProduct = await Product.findOne({
        where: {
          id: product_id,
        },
      });

      // check user authorization
      if (currentUser.id !== checkOwnerProduct.user_id) {
        return res.sendNotFound("sorry owner product is not you");
      }

      const { name, price, description, status, product_image_id } = req.body;

      const productId = {
        where: {
          id: product_id,
        },
      };

      const updated = await Product.update(
        {
          name,
          price,
          description,
          status,
          product_image_id,
        },
        productId
      );

      res.sendJson(200, true, "success update product", updated);

      if (updated == 0) {
        return res.sendNotFound("id data product not found");
      }
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  delete: async (req, res) => {
    try {
      const currentUser = req.user;
      const product_id = req.params.id;

      const checkOwnerProduct = await Product.findOne({
        where: {
          id: product_id,
        },
      });

      console.log(`check owner product => ${checkOwnerProduct}`);

      if (!checkOwnerProduct) {
        return res.sendNotFound("id data product not found");
      }
      console.log("masih di lewati");

      if (currentUser.id !== checkOwnerProduct.user_id) {
        return res.sendNotFound("sorry owner product is not you");
      }

      const deleted = await Product.destroy({
        where: {
          id: product_id,
        },
      });

      if (!deleted) {
        return res.sendNotFound("id data product not found");
      }

      res.sendJson(200, true, "success delete data product", deleted);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },
};
