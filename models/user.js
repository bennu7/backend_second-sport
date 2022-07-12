"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Product, { foreignKey: "user_id", as: "products" });
      User.hasMany(models.Transaction, {foreignKey: "user_id", as: "transactions"})
    }

    static authenticate = async ({ email, password }) => {
      try {
        const user = await User.findOne({
          where: {
            email: email
          }
        });
        if (!user) return Promise.reject(new Error('user not found!'));

        const isPasswordValid = user.checkPassword(password);
        if (!isPasswordValid) return Promise.reject(new Error('wrong password!'));

        return Promise.resolve(user);

      } catch (err) {
        return Promise.reject(err);
      }
    }

    generateToken = () => {
      const payload = {
        id: this.id,
        name: this.name,
        email: this.email
      };

      const secretKey = process.env.JWT_SECRET;
      const token = jwt.sign(payload, secretKey);
      return token;
    };

    checkPassword = password => {
      return bcrypt.compareSync(password, this.password);
    };

    isValidBecomeSeller = () => {
      return this.full_name 
        && this.email 
        && this.address 
        && this.profile_image 
        && this.role 
        && this.city
        && this.mobile_phone
        && this.avatar;
    }

  }
  User.init(
    {
      full_name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profile_image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      mobile_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      avatar: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
