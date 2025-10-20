const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    avatar: {
        type: String,
        default: '' // Cloudinary URL
    },
    role: {
        type: String,
        enum: ['user', 'facility_owner', 'admin'],
        default: 'user'
    },
    verified: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    otp: String, // Add OTP field
    otpExpires: Date, // Add OTP expiry field
    bookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    }]
}, {
    timestamps: true
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    console.log('Comparing passwords:');
    console.log('Entered Password (plain): ', enteredPassword);
    console.log('Stored Password (hashed): ', this.password);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('bcrypt.compare result: ', isMatch);
    return isMatch;
};

module.exports = mongoose.model('User', userSchema);
