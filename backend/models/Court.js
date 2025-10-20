const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema({
    facilityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facility',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    sportType: {
        type: String,
        required: true
    },
    pricePerHour: {
        type: Number,
        required: true,
        min: 0
    },
    operatingHours: [{
        day: { type: String, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
    }],
    slots: [{
        date: { type: Date, required: true },
        time: { type: String, required: true },
        isBooked: { type: Boolean, default: false },
        bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Court', courtSchema);
