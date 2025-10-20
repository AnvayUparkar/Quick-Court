const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: { // Add a human-readable address field
            type: String,
            required: true,
        },
    },
    sports: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    photos: [{
        type: String // Cloudinary URLs
    }],
    primaryPhoto: {
        type: String // URL of the primary photo
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    courts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Court'
    }]
}, {
    timestamps: true
});

// Add a 2dsphere index for geospatial queries (optional, but good practice for location data)
facilitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Facility', facilitySchema);
