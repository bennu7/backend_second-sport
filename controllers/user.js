const { User, Product, ProductImage, Transaction } = require("../models");
const Validator = require("fastest-validator");
const V = new Validator();
const bcrypt = require("bcrypt");
const Sentry = require("../lib/sentry");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  register: async (req, res) => {
    try {
      const schema = {
        full_name: "string|required",
        email: "email|required",
        password: "string|required|min:7",
      };

      const validator = V.validate(req.body, schema);
      if (validator.length) {
        return res.sendBadRequest("bad request schema");
      }

      const isEmailExist = await User.findOne({
        where: {
          email: req.body.email,
        },
      });

      if (isEmailExist) {
        return res.sendBadRequest(
          "email already exist, please use another email"
        );
      }

      const hashPassword = await bcrypt.hash(req.body.password, 10);

      const newUser = await User.create({
        ...req.body,
        password: hashPassword,
        type: "basic",
        role: "buyer",
      });

      return res.sendDataCreated("success create a new user", {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: newUser.role,
        type: newUser.type,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  index: async (req, res) => {
    try {
      if (req.query.name) {
        const name = req.query.name;

        const searchByName = await User.findAll({
          where: {
            full_name: {
              [Op.like]: `%${name}%`,
            },
          },
          include: [
            { model: Product, as: "products" },
            { model: Transaction, as: "transactions" },
          ],
        });

        if (searchByName == "") {
          return res.sendNotFound(
            "data not found, maybe please insert your full name",
            []
          );
        }

        return res.sendJson(200, true, "success get data user", searchByName);
      }

      if (req.query.email) {
        const email = req.query.email;

        const searchByEmail = await User.findAll({
          where: {
            email: {
              [Op.like]: `%${email}%`,
            },
          },
        });

        if (searchByEmail == "") {
          return res.sendNotFound(
            "data not found, maybe please insert your full email",
            []
          );
        }

        return res.sendJson(200, true, "success get data user", searchByEmail);
      }

      const data = await User.findAll({
        order: [["id", "DESC"]],
      });

      return res.sendJson(200, true, "success get all data user", data);
    } catch (err) {
      Sentry.captureException(err);
      return res.sendServerError(err.message);
    }
  },

  showUser: async (req, res) => {
    try {
      const user_id = req.params.id;

      const user = await User.findOne({
        where: { id: user_id },
        include: [
          { model: Product, as: "products" },
          { model: Transaction, as: "transactions" },
        ],
      });
      if (!user) {
        return res.sendNotFound("user not found");
      }

      var avatar;
      const image = await ProductImage.findOne({ where: { id: user.avatar } });
      if (image) {
        avatar = image;
      }

      res.status(200).json({
        status: true,
        message: "ok",
        data: {
          ...user.dataValues,
          avatar: avatar,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
  },

  updateAvatar: async (req, res) => {
    try {
      const schema = {
        user_id: "number|required",
        image_id: "number|required",
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json({
          status: false,
          message: "bad request!",
          data: validate,
        });
      }

      const { user_id, image_id } = req.body;

      const image = await ProductImage.findOne({ where: { id: image_id } });
      if (!image) {
        return res.status(400).json({
          status: false,
          message: "image is does'nt exist!",
          data: null,
        });
      }

      const user = await User.findOne({ where: { id: user_id } });
      if (!user) {
        return res.status(400).json({
          status: false,
          message: "user is does'nt exist!",
          data: null,
        });
      }

      const updatedUser = await User.update(
        {
          avatar: image_id,
        },
        {
          where: { id: user_id },
        }
      );

      res.status(200).json({
        status: true,
        message: "avatar changed succesfully!",
        data: updatedUser,
      });
    } catch (err) {
      return res.status(500).json({
        status: false,
        message: err.message,
        data: null,
      });
    }
  },
};
