const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    consultantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Consultant'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
