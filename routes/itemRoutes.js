const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const offerRoutes = require('./offerRoutes');
const upload = require('../middleware/fileUpload'); 
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateId, validateItem } = require('../middleware/validator');

router.get('/', itemController.getAllItems);
router.get('/new', isLoggedIn, itemController.getNewItemForm);
router.post('/', upload, isLoggedIn, validateItem, itemController.createNewItem);
router.get('/:id', validateId, itemController.getItemDetails);
router.get('/:id/edit', isLoggedIn, isAuthor, validateId, itemController.getEditItemForm);
router.put('/:id', upload, isLoggedIn, isAuthor, validateId, validateItem, itemController.editItem);
router.post('/:id/delete', isLoggedIn, isAuthor, validateId, itemController.deleteItem);

router.use('/:id/offers', validateId, offerRoutes);

module.exports = router;