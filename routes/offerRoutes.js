const express = require('express');
const router = express.Router({ mergeParams: true });
const offerController = require('../controllers/offerController');
const { isLoggedIn, isAuthor } = require('../middleware/auth');
const { validateOffer } = require('../middleware/validator');

// POST /items/:id/offers: Make an offer on an item
router.post('/', isLoggedIn, validateOffer, offerController.makeOffer);

// GET /items/:id/offers: View all offers received on an item
router.get('/', isLoggedIn, isAuthor, offerController.viewOffers);

// POST /items/:id/offers/:offerId/accept: Accept an offer on an item
router.post('/:offerId/accept', isLoggedIn, isAuthor, offerController.acceptOffer);

module.exports = router;