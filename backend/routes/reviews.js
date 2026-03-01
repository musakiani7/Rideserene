const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../controllers/chauffeurController');

// All routes require chauffeur authentication
router.use(protect);

// Get all reviews for the authenticated chauffeur
router.get('/', reviewController.getChauffeurReviews);

// Get review statistics
router.get('/statistics', reviewController.getReviewStatistics);

// Respond to a specific review
router.post('/:reviewId/respond', reviewController.respondToReview);

module.exports = router;
