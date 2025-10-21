const express = require('express');
const router = express.Router();
const { getReviews, getReviewsForFacility } = require('../controllers/ratingController');

router.get('/', getReviews);
router.get('/facility/:facilityId', getReviewsForFacility);

module.exports = router;
