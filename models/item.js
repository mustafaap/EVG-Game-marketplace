const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Offer = require('./offer');

// Define schema
const itemSchema = new Schema({
    title: { type: String, required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    condition: { type: String, enum: ['New', 'Like New', 'Used', 'Refurbished', 'Other'], required: true },
    price: { type: Number, required: true, min: 0.01 },
    details: { type: String, required: true },
    image: { type: String }, // Stores file path
    active: { type: Boolean, default: true }, // Default active
    totalOffers: { type: Number, default: 0 }, // Total offers received
    highestOffer: { type: Number, default: 0 } // Highest offer received
});

// Middleware to delete associated offers when an item is deleted
itemSchema.pre('findOneAndDelete', async function (next) {
    const itemId = this.getQuery()._id;
    await Offer.deleteMany({ item: itemId });
    next();
});

// Compile model
module.exports = mongoose.model('Item', itemSchema);