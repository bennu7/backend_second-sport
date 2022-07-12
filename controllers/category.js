const { Category, ProductCategory, Product } = require('../models')
const validator = new (require('fastest-validator'));
const Sentry = require('../lib/sentry');

module.exports = {
    getAllCategory: async (req, res) => {
        try {
            return res.sendJson(200,
                true,
                'successfully get all category!',
                await Category.findAll()
            );
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    getProductByCategory: async (req, res) => {
        try {
            const name_category = req.params.category;

            const category = await Category.findOne({
                where: {
                    name_category
                },
                include: [{ model: Product, as: 'products' }]
            });

            if (!category) return res.sendNotFound('category ' + name_category + ' not found!');

            return res.sendJson(200,
                true,
                'successfully fetch data!',
                category.products
            );
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    createCategory: async (req, res) => {
        try {
            const name_category = req.body.name_category;
            const validated = validator.validate({ name_category }, {
                name_category: 'string'
            });

            if (validated.length)
                return res.sendBadRequest('name_category is not valid!');

            const isAvailable = await Category.findOne({
                where: {
                    name_category
                }
            });

            if (isAvailable) return res.sendBadRequest('name_category ' + name_category + ' already exist!');

            const category = await Category.create({
                name_category
            });

            return res.sendDataCreated('successfully create category!', { category });
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    updateCategory: async (req, res) => {
        try {
            const id = req.params.id;
            const name_category = req.body.name_category;
            const validated = validator.validate({ name_category }, {
                name_category: 'string'
            });

            if (validated.length)
                return res.sendBadRequest('name_category is not valid!');

            const updated = await Category.update({
                name_category
            }, {
                where: {
                    id
                }
            });

            if (!updated)
                throw Error('failed to update category for id ' + id);

            return res.sendJson(200, true, 'successfully update category!', updated);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const id = req.params.id;
            const deleted = await Category.destroy({
                where: {
                    id
                }
            });

            if (!deleted) throw Error('failed to delete category!');

            return res.sendJson(200, true, 'successfully delete category!', deleted);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    getCategory: async (req, res) => {
        try {
            const category = await Category.findOne({
                where: {
                    id: req.params.id
                }
            });
            return res.sendJson(200,
                true,
                'successfully get category!',
                category
            );
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    }
  }
