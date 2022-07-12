"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Product.belongsToMany(models.Category, {
        through: models.ProductCategory,
        foreignKey: "product_id",
        as: "category",
      });
      Product.belongsTo(models.User, { foreignKey: "user_id", as: "owner" });
      Product.hasMany(models.ProductImage, {
        foreignKey: "product_id",
        as: "productImages",
      });

      Product.hasMany(models.Transaction, {
        foreignKey: "product_id",
        as: "transactions",
      });
    }
  }
  Product.init(
    {
      name: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      price: DataTypes.BIGINT,
      description: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      product_image_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Product",
    }
  );
  return Product;
};
