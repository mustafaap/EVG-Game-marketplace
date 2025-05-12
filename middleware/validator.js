const { body } = require('express-validator');

// Validation rules for creating/updating an item
exports.validateItem = [
    body('title')
        .trim()
        .escape()
        .notEmpty().withMessage('Title is required'),
    body('condition')
        .trim()
        .isIn(['New', 'Like New', 'Used', 'Refurbished', 'Other'])
        .withMessage('Invalid condition'),
    body('price')
        .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('details')
        .trim()
        .escape()
        .notEmpty().withMessage('Details are required'),
];

// Validation rules for creating an offer
exports.validateOffer = [
    body('amount')
        .trim()
        .escape()
        .notEmpty().withMessage('Offer amount is required')
        .isFloat({ gt: 0 }).withMessage('Offer amount must be greater than 0'),
];

// Validation rules for user registration (Sign-Up)
exports.validateSignUp = [
    body('firstName')
        .trim()
        .escape()
        .notEmpty().withMessage('First name is required'),
    body('lastName')
        .trim()
        .escape()
        .notEmpty().withMessage('Last name is required'),
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters'),
];

// Validation rules for user login
exports.validateLogin = [
    body('email')
        .trim()
        .normalizeEmail()
        .isEmail().withMessage('Invalid email address'),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

// Validation for ID
exports.validateId = (req, res, next) => {
    let id = req.params.id;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        let err = new Error('Invalid item id');
        err.status = 400;
        return next(err);
    }

    return next();
};