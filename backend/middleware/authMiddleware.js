const jwt = require('jsonwebtoken');
const catchAsync = require('./catchAsync');
const User = require('../models/User');

exports.protect = catchAsync(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        console.log('Protect Middleware: No token found.');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Protect Middleware: Decoded JWT:', decoded);
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            console.log('Protect Middleware: User not found for decoded ID:', decoded.id);
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        console.log('Protect Middleware: req.user after finding by ID:', req.user);
        console.log('Protect Middleware: User authenticated and authorized.');
        next();
    } catch (error) {
        console.log('Protect Middleware: Token verification failed:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
});

exports.authorize = (...roles) => {
    return (req, res, next) => {
        console.log('Authorize Middleware: User (req.user):', req.user);
        console.log('Authorize Middleware: User Role (req.user.role):', req.user ? req.user.role : 'N/A');
        console.log('Authorize Middleware: Required Roles:', roles);
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `User role ${req.user ? req.user.role : 'unauthenticated'} is not authorized to access this route` });
        }
        next();
    };
};