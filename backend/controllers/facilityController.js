const Facility = require('../models/Facility');
const Court = require('../models/Court');
const catchAsync = require('../middleware/catchAsync');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

// Helper function to safely delete local files
const safeUnlink = async (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            await unlinkAsync(filePath);
            console.log('Successfully deleted local file:', filePath);
        }
    } catch (error) {
        console.log('Warning: Could not delete local file:', filePath, error.message);
    }
};

// Helper function to extract Cloudinary public ID from URL
const extractPublicId = (url) => {
    try {
        const urlParts = url.split('/');
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const folder = 'quickcourt/facilities';
        return `${folder}/${publicIdWithExtension.split('.')[0]}`;
    } catch (error) {
        console.log('Error extracting public ID from URL:', url, error.message);
        return null;
    }
};

// @desc    Get all facilities
// @route   GET /api/facilities
// @access  Public
exports.getFacilities = catchAsync(async (req, res, next) => {
    const facilities = await Facility.find({ approved: true }).populate({
        path: 'courts',
        populate: {
            path: 'slots',
            // Optionally select specific fields if needed
            // select: 'date time isBooked' 
        }
    });
    res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities
    });
});

// @desc    Get single facility
// @route   GET /api/facilities/:id
// @access  Public
exports.getFacility = catchAsync(async (req, res, next) => {
    const facility = await Facility.findById(req.params.id).populate('courts');

    if (!facility || !facility.approved) {
        return res.status(404).json({ 
            success: false,
            message: 'Facility not found or not approved' 
        });
    }

    res.status(200).json({
        success: true,
        data: facility
    });
});

// @desc    Get facilities by owner
// @route   GET /api/facilities/owner/:ownerId
// @access  Private/Facility Owner or Admin
exports.getOwnerFacilities = catchAsync(async (req, res, next) => {
    const { ownerId } = req.params;
    console.log('getOwnerFacilities called with ownerId:', ownerId);

    // Check if user is authorized to view these facilities
    if (req.user.role === 'facility_owner' && req.user._id.toString() !== ownerId) {
        console.log('Authorization failed: User role is facility_owner but ID mismatch');
        return res.status(403).json({ 
            success: false,
            message: 'Not authorized to view other owner\'s facilities' 
        });
    }

    const facilities = await Facility.find({ ownerId }).populate('courts');
    console.log('Found facilities:', facilities.length);

    res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities
    });
});

// @desc    Create new facility
// @route   POST /api/facilities
// @access  Private/Facility Owner
exports.createFacility = catchAsync(async (req, res, next) => {
    console.log('Create facility request received');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    const { name, description, location, sports, amenities, primaryPhoto } = req.body;

    // Validate required fields
    if (!name || !description || !location || !sports) {
        return res.status(400).json({ 
            success: false,
            message: 'Please enter all required fields: name, description, location, and sports' 
        });
    }

    let parsedLocation;
    let parsedSports;
    let parsedAmenities = [];

    try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        parsedSports = typeof sports === 'string' ? JSON.parse(sports) : sports;
        if (amenities) {
            parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        }
    } catch (error) {
        console.error('JSON parsing error:', error.message);
        return res.status(400).json({ 
            success: false,
            message: 'Invalid JSON format in location, sports, or amenities fields' 
        });
    }

    // Validate location structure
    if (!parsedLocation.address || !parsedLocation.coordinates || 
        !Array.isArray(parsedLocation.coordinates) || parsedLocation.coordinates.length !== 2) {
        return res.status(400).json({ 
            success: false,
            message: 'Location must include address and coordinates array [longitude, latitude]' 
        });
    }

    let photoUrls = [];
    
    // Handle photo uploads if any files are present
    if (req.files && req.files.length > 0) {
        console.log('Processing', req.files.length, 'photo uploads');
        
        for (const file of req.files) {
            try {
                console.log('Uploading file:', file.originalname);
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'quickcourt/facilities',
                    resource_type: 'auto'
                });
                photoUrls.push(result.secure_url);
                console.log('Photo uploaded successfully:', result.public_id);
                
                // Clean up local file
                await safeUnlink(file.path);
                
            } catch (uploadError) {
                console.error('Error uploading individual photo:', uploadError);
                // Clean up any local files
                await safeUnlink(file.path);
                
                // If we already uploaded some photos, we should continue
                // but log the error
                console.log('Continuing with remaining uploads...');
            }
        }
    }

    try {
        const facility = await Facility.create({
            name: name.trim(),
            description: description.trim(),
            location: {
                type: 'Point',
                coordinates: parsedLocation.coordinates,
                address: parsedLocation.address.trim(),
            },
            sports: Array.isArray(parsedSports) ? parsedSports.filter(s => s.trim()) : [],
            amenities: Array.isArray(parsedAmenities) ? parsedAmenities.filter(a => a.trim()) : [],
            photos: photoUrls,
            primaryPhoto: primaryPhoto || (photoUrls.length > 0 ? photoUrls[0] : undefined),
            ownerId: req.user._id,
            approved: false
        });

        console.log('Facility created successfully:', facility._id);

        res.status(201).json({
            success: true,
            message: 'Facility created successfully, awaiting admin approval',
            data: facility
        });
    } catch (dbError) {
        console.error('Database error creating facility:', dbError);
        // Clean up any uploaded photos if facility creation fails
        for (const photoUrl of photoUrls) {
            try {
                const publicId = extractPublicId(photoUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            } catch (cleanupError) {
                console.log('Error cleaning up uploaded photo:', cleanupError.message);
            }
        }
        
        return res.status(500).json({
            success: false,
            message: 'Error creating facility in database'
        });
    }
});

// @desc    Update facility
// @route   PUT /api/facilities/:id
// @access  Private/Facility Owner or Admin
exports.updateFacility = catchAsync(async (req, res, next) => {
    console.log('=== UPDATE FACILITY REQUEST ===');
    console.log('Facility ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Files received:', req.files ? req.files.length : 0);

    let facility;
    try {
        facility = await Facility.findById(req.params.id);
    } catch (error) {
        console.error('Error finding facility:', error);
        return res.status(400).json({ 
            success: false,
            message: 'Invalid facility ID format' 
        });
    }

    if (!facility) {
        return res.status(404).json({ 
            success: false,
            message: 'Facility not found' 
        });
    }

    console.log('Facility found - Owner ID:', facility.ownerId.toString());

    // Check if user is owner or admin
    if (facility.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        console.log('Authorization failed - not owner or admin');
        return res.status(403).json({ 
            success: false,
            message: 'Not authorized to update this facility' 
        });
    }

    const { name, description, location, sports, amenities, currentPhotoUrls, primaryPhoto } = req.body;

    try {
        // Update basic fields if provided
        if (name) {
            facility.name = name.trim();
            console.log('Updated name:', facility.name);
        }
        if (description) {
            facility.description = description.trim();
            console.log('Updated description length:', facility.description.length);
        }

        // Update sports if provided
        if (sports) {
            try {
                const parsedSports = typeof sports === 'string' ? JSON.parse(sports) : sports;
                facility.sports = Array.isArray(parsedSports) ? parsedSports.filter(s => s && s.trim()) : [];
                console.log('Updated sports:', facility.sports);
            } catch (error) {
                console.error('Error parsing sports:', error);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid sports format' 
                });
            }
        }

        // Update amenities if provided
        if (amenities) {
            try {
                const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
                facility.amenities = Array.isArray(parsedAmenities) ? parsedAmenities.filter(a => a && a.trim()) : [];
                console.log('Updated amenities:', facility.amenities);
            } catch (error) {
                console.error('Error parsing amenities:', error);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid amenities format' 
                });
            }
        }

        // Update location if provided
        if (location) {
            try {
                const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
                if (parsedLocation.address) {
                    facility.location.address = parsedLocation.address.trim();
                }
                if (parsedLocation.coordinates && Array.isArray(parsedLocation.coordinates) && parsedLocation.coordinates.length === 2) {
                    facility.location.coordinates = parsedLocation.coordinates;
                }
                console.log('Updated location:', facility.location);
            } catch (error) {
                console.error('Error parsing location:', error);
                return res.status(400).json({ 
                    success: false,
                    message: 'Invalid location format' 
                });
            }
        }

        // Handle photo updates
        let newPhotoUrls = [];
        
        // Parse current photo URLs
        if (currentPhotoUrls) {
            try {
                newPhotoUrls = typeof currentPhotoUrls === 'string' ? JSON.parse(currentPhotoUrls) : currentPhotoUrls;
                if (!Array.isArray(newPhotoUrls)) {
                    newPhotoUrls = [];
                }
                console.log('Keeping existing photos:', newPhotoUrls.length);
            } catch (error) {
                console.log('Error parsing currentPhotoUrls:', error.message);
                newPhotoUrls = [];
            }
        }

        // Upload new photos if provided
        if (req.files && req.files.length > 0) {
            console.log('Processing new photo uploads:', req.files.length);
            
            for (const file of req.files) {
                try {
                    console.log('Uploading new photo:', file.originalname);
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: 'quickcourt/facilities',
                        resource_type: 'auto'
                    });
                    newPhotoUrls.push(result.secure_url);
                    console.log('New photo uploaded:', result.public_id);
                    
                    // Clean up local file
                    await safeUnlink(file.path);
                    
                } catch (uploadError) {
                    console.error('Error uploading new photo:', uploadError);
                    await safeUnlink(file.path);
                    
                    // Return error for photo upload issues
                    return res.status(500).json({ 
                        success: false,
                        message: `Error uploading photos: ${uploadError.message}` 
                    });
                }
            }
        }

        // Delete old photos that are no longer needed
        const oldPhotoUrls = facility.photos || [];
        const photosToDelete = oldPhotoUrls.filter(url => !newPhotoUrls.includes(url));
        
        console.log('Photos to delete:', photosToDelete.length);
        for (const photoUrl of photosToDelete) {
            try {
                const publicId = extractPublicId(photoUrl);
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Deleted old photo:', publicId);
                }
            } catch (deleteError) {
                console.log('Warning: Could not delete old photo:', deleteError.message);
                // Continue processing - don't fail the update for cleanup issues
            }
        }

        facility.photos = newPhotoUrls;
        facility.primaryPhoto = primaryPhoto || (newPhotoUrls.length > 0 ? newPhotoUrls[0] : undefined);
        console.log('Final photo count:', facility.photos.length);

        const updatedFacility = await facility.save();
        console.log('Facility updated successfully');

        res.status(200).json({
            success: true,
            message: 'Facility updated successfully',
            data: updatedFacility
        });

    } catch (error) {
        console.error('Error during facility update:', error);
        
        // Clean up any local files that might still exist
        if (req.files) {
            for (const file of req.files) {
                await safeUnlink(file.path);
            }
        }
        
        return res.status(500).json({
            success: false,
            message: 'Internal server error during facility update'
        });
    }
});

// @desc    Delete facility
// @route   DELETE /api/facilities/:id
// @access  Private/Facility Owner or Admin
exports.deleteFacility = catchAsync(async (req, res, next) => {
    console.log('=== DELETE FACILITY REQUEST ===');
    console.log('Facility ID:', req.params.id);
    console.log('User ID:', req.user._id);
    console.log('User Role:', req.user.role);

    let facility;
    try {
        facility = await Facility.findById(req.params.id);
    } catch (error) {
        console.error('Error finding facility for deletion:', error);
        return res.status(400).json({ 
            success: false,
            message: 'Invalid facility ID format' 
        });
    }

    if (!facility) {
        return res.status(404).json({ 
            success: false,
            message: 'Facility not found' 
        });
    }

    // Check if user is owner or admin
    if (facility.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        console.log('Authorization failed - not owner or admin');
        return res.status(403).json({ 
            success: false,
            message: 'Not authorized to delete this facility' 
        });
    }

    try {
        // Delete all associated photos from Cloudinary
        if (facility.photos && facility.photos.length > 0) {
            console.log('Deleting photos from Cloudinary:', facility.photos.length);
            for (const photoUrl of facility.photos) {
                try {
                    const publicId = extractPublicId(photoUrl);
                    if (publicId) {
                        await cloudinary.uploader.destroy(publicId);
                        console.log('Deleted photo:', publicId);
                    }
                } catch (deletePhotoError) {
                    console.log('Warning: Could not delete photo:', deletePhotoError.message);
                }
            }
        }

        // Delete all associated courts
        const deletedCourts = await Court.deleteMany({ facilityId: facility._id });
        console.log('Deleted associated courts:', deletedCourts.deletedCount);

        // Delete the facility
        await Facility.findByIdAndDelete(req.params.id);
        console.log('Facility deleted successfully');

        res.status(200).json({
            success: true,
            message: 'Facility and all associated courts removed successfully'
        });

    } catch (error) {
        console.error('Error during facility deletion:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error during facility deletion' 
        });
    }
});