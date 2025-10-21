const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReviews, getReviewsForFacility, rateFacility } = require('../controllers/ratingController');

router.route('/').get(getReviews).post(protect, rateFacility);
router.get('/facility/:facilityId', getReviewsForFacility);

module.exports = router;
