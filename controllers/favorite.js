const {Product, Favorite} = require('../models');
const Sentry = require('../lib/sentry');
module.exports = {
    createFavorite : async (req, res) => {
        try {
            const product_id = req.body.product_id;
            const product = await Product.findOne({
                where : {
                    id : product_id
                }
            });

            if(! product) return res.sendNotFound('product with id ' + product_id + ' not found !');

            const favorite = await Favorite.create({
                product_id : product_id,
                user_id : req.user.id
            });

            return res.sendDataCreated('successfully create new favorite!', favorite);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    getFavorite : async (req, res) => {
        try {
            const id = req.params.id;
            const favorite = await Favorite.findOne({
                where : {
                    id
                }
            });
            if(! favorite) return res.sendNotFound('favorite with id ' + id + ' not found!');
            return res.sendJson(200, true, 'successfully fetch data favorite!', favorite);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    getAllFavorite : async (req, res) => {
        try {
            const favorites = await Favorite.findAll({
                where : {
                    user_id : req.user.id
                }
            });

            return res.sendJson(200, true, 'successfully fetch all data favorite!', favorites);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    },

    deleteFavorite : async (req, res) => {
        try {
            const id = req.params.id;
            const deleted = await Favorite.destroy({
                where : {
                    id
                }
            });

            if(! deleted) throw Error('failed to delete favorite with id ' + id);

            return res.sendJson('successfully delete favorite!', deleted);
        } catch (error) {
            Sentry.captureException(error);
            return res.sendServerError(error.message);
        }
    }
}