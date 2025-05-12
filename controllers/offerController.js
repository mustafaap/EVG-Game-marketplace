const { validationResult } = require('express-validator');
const Offer = require('../models/offer');
const Item = require('../models/item');

exports.makeOffer = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect(`/items/${req.params.id}`);
    }

    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        if (item.seller.equals(req.session.user)) {
            let err = new Error('Unauthorized access. You cannot make an offer on your own item');
            err.status = 401;
            return next(err);
        }

        const offer = new Offer({
            amount: req.body.amount,
            user: req.session.user,
            item: item.id
        });

        await offer.save();

        // Update item with totalOffers and highestOffer
        item.totalOffers += 1;
        item.highestOffer = Math.max(item.highestOffer, offer.amount);
        await item.save();

        req.flash('success', 'Offer made successfully!');
        res.redirect(`/items/${item.id}`);
    } catch (err) {
        next(err);
    }
};

exports.viewOffers = async (req, res, next) => {
    try {
        const item = await Item.findById(req.params.id).populate('seller');
        if (!item) {
            req.flash('error', 'Item not found');
            return res.redirect('/items');
        }

        if (!item.seller.equals(req.session.user)) {
            req.flash('error', 'Unauthorized to view offers for this item');
            return res.redirect('/items');
        }

        const offers = await Offer.find({ item: item.id }).populate('user', 'firstName lastName');
        res.render('offers/offers', { item, offers });
    } catch (err) {
        next(err);
    }
};

exports.acceptOffer = async (req, res, next) => {
    try {
        const offer = await Offer.findById(req.params.offerId).populate('item');
        if (!offer) {
            req.flash('error', 'Offer not found');
            return res.redirect('/items');
        }

        const item = offer.item;

        if (!item.seller.equals(req.session.user)) {
            req.flash('error', 'Unauthorized to accept this offer');
            return res.redirect('/items');
        }

        // Update the item to set it as inactive
        item.active = false;
        await item.save();

        // Update the accepted offer
        offer.status = 'accepted';
        await offer.save();

        // Update all other offers for the same item to 'rejected'
        await Offer.updateMany(
            { item: item.id, _id: { $ne: offer.id } },
            { status: 'rejected' }
        );

        req.flash('success', 'Offer accepted successfully!');
        res.redirect(`/items/${item.id}/offers`);
    } catch (err) {
        next(err);
    }
};