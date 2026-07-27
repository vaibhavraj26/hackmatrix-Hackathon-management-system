const express = require('express');
const router = express.Router();
const {
  submitProject,
  editSubmission,
  getSubmission,
  getHackathonSubmissions,
  updateSubmissionStatus
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('participant'), submitProject);
router.put('/:id', protect, authorize('participant'), editSubmission);
router.get('/:id', protect, getSubmission);
router.get('/hackathon/:hackathonId', protect, getHackathonSubmissions);
router.put('/:id/status', protect, authorize('organizer', 'admin'), updateSubmissionStatus);

module.exports = router;
