const model = require('../models/user');
const Item = require('../models/item'); 
const Offer = require('../models/offer');
const { validationResult } = require('express-validator');

exports.new = (req, res) => {
    res.render('./user/new');
};

exports.create = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash('error', errors.array().map(err => err.msg).join(', '));
        return res.redirect('/users/new');
    }

    let user = new model(req.body);
    user.save()
        .then(user => {
            req.flash('success', 'Registration successful! Please log in.');
            res.redirect('/users/login');
        })
        .catch(err => {
            if (err.cause && err.cause.code === 11000) {
                req.flash('error', 'Email has already been used');
                return res.redirect('/users/new');
            }
            next(err);
        });
};

exports.getUserLogin = (req, res, next) => {
    res.render('./user/login');
};

exports.login = (req, res, next) => {
    let { email, password } = req.body;
    model.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Incorrect email address');
                return res.redirect('/users/login');
            } else {
                user.comparePassword(password)
                    .then(result => {
                        if (result) {
                            req.session.user = user._id;
                            req.flash('success', 'You have successfully logged in!');
                            res.redirect('/users/profile');
                        } else {
                            req.flash('error', 'Incorrect password');
                            res.redirect('/users/login');
                        }
                    });
            }
        })
        .catch(err => next(err));
};

exports.profile = (req, res, next) => {
    let id = req.session.user;
    Promise.all([
        model.findById(id),
        Item.find({ seller: id }),
        Offer.find({ user: id }).populate('item', 'title')
    ])
    .then(([user, items, offers]) => {
        res.render('./user/profile', { user, items, offers });
    })
    .catch(err => next(err));
};

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        if (err){
            return next(err);
        }
        res.redirect('/');
    });
};
