const router = require('express').Router();
const favoriteController = require('../controllers/favorite');

router.get('/', favoriteController.getAllFavorite);

router.get('/:id', favoriteController.getFavorite);

router.post('/', favoriteController.createFavorite);

router.delete('/:id', favoriteController.deleteFavorite);

module.exports = router;