const Item = require('../models/item');
const { validationResult } = require('express-validator');

module.exports = {
    getAllItems: async (req, res, next) => {
        try {
            let searchQuery = { active: true }; // Only fetch active items

            if (req.query.q) {
                const searchTerm = req.query.q.trim();
                searchQuery = {
                    active: true, // Ensure only active items are included in the search
                    $or: [
                        { title: { $regex: searchTerm, $options: "i" } },
                        { details: { $regex: searchTerm, $options: "i" } }
                    ]
                };
            }

            const items = await Item.find(searchQuery).sort({ price: 1 });
            res.render('showAll', { items, messages: req.flash() });
        } catch (err) {
            next(err);
        }
    },

    getNewItemForm: (req, res) => {
        res.render('new', { messages: req.flash() });
    },

    createNewItem: async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array().map(err => err.msg).join(', '));
            return res.redirect('/items/new');
        }

        try {
            const newItem = new Item({
                title: req.body.title,
                seller: req.session.user,
                condition: req.body.condition,
                price: req.body.price,
                details: req.body.details,
                image: req.file ? '/images/' + req.file.filename : null
            });
            await newItem.save();
            req.flash('success', 'Item listed successfully!');
            res.redirect('/items');
        } catch (err) {
            next(err);
        }
    },

    getItemDetails: async (req, res, next) => {
        try {
            const item = await Item.findById(req.params.id).populate('seller', 'firstName lastName');
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('/items');
            }
            res.render('show', { item, messages: req.flash() });
        } catch (err) {
            if (err.name === 'CastError') {
                req.flash('error', 'Invalid Item ID');
                return res.redirect('/items');
            }
            next(err);
        }
    },

    getEditItemForm: async (req, res, next) => {
        try {
            const item = await Item.findById(req.params.id);
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('/items');
            }
            res.render('edit', { item, messages: req.flash() });
        } catch (err) {
            if (err.name === 'CastError') {
                req.flash('error', 'Invalid Item ID');
                return res.redirect('/items');
            }
            next(err);
        }
    },

    editItem: async (req, res, next) => {
        try {
            const item = await Item.findById(req.params.id);
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('/items');
            }

            const updatedItem = {
                title: req.body.title,
                condition: req.body.condition,
                price: req.body.price,
                details: req.body.details,
                image: req.file ? '/images/' + req.file.filename : item.image,  
                active: req.body.active === 'on' ? true : false
            };

            const success = await Item.findByIdAndUpdate(req.params.id, updatedItem, { new: true, runValidators: true });

            if (success) {
                req.flash('success', 'Item updated successfully!');
                res.redirect(`/items/${req.params.id}`);
            } else {
                req.flash('error', 'Update failed: item not found');
                res.redirect('/items');
            }
        } catch (err) {
            if (err.name === 'ValidationError') {
                req.flash('error', 'Validation Error: ' + err.message);
                return res.redirect(`/items/${req.params.id}/edit`);
            } else if (err.name === 'CastError') {
                req.flash('error', 'Invalid Item ID');
                return res.redirect('/items');
            }
            next(err);
        }
    },

    deleteItem: async (req, res, next) => {
        try {
            const item = await Item.findByIdAndDelete(req.params.id);
            if (!item) {
                req.flash('error', 'Item not found');
                return res.redirect('/items');
            }
            req.flash('success', 'Item deleted successfully!');
            res.redirect('/items');
        } catch (err) {
            if (err.name === 'CastError') {
                req.flash('error', 'Invalid Item ID');
                return res.redirect('/items');
            }
            next(err);
        }
    }
};
