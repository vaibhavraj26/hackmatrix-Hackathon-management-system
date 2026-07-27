const express = require('express');
const router = express.Router();
const {
  createHackathon,
  getHackathons,
  getHackathon,
  updateHackathon,
  deleteHackathon,
  assignJudges,
  getAvailableJudges
} = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getHackathons);
router.get('/judges/all', protect, authorize('organizer', 'admin'), getAvailableJudges);
router.get('/:id', getHackathon);

router.post('/', protect, authorize('organizer', 'admin'), createHackathon);
router.put('/:id', protect, authorize('organizer', 'admin'), updateHackathon);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteHackathon);
router.put('/:id/judges', protect, authorize('organizer', 'admin'), assignJudges);

module.exports = router;
