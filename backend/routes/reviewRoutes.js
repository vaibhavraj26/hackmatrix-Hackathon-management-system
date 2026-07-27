const express = require('express');
const router = express.Router();
const {
  submitReview,
  getSubmissionReviews,
  getAssignedSubmissions,
  getLeaderboard
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/auth');

router.get('/leaderboard/:hackathonId', getLeaderboard);
router.get('/submission/:submissionId', protect, getSubmissionReviews);
router.get('/assigned', protect, authorize('judge'), getAssignedSubmissions);
router.post('/', protect, authorize('judge'), submitReview);

module.exports = router;
