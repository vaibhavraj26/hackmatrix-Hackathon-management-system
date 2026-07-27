const express = require('express');
const router = express.Router();
const {
  createTeam,
  joinTeam,
  leaveTeam,
  removeMember,
  transferLeadership,
  deleteTeam,
  updateRegistrationStatus,
  getHackathonTeams,
  getMyTeams,
  getTeamById
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('participant'), createTeam);
router.post('/join', protect, authorize('participant'), joinTeam);
router.get('/my', protect, getMyTeams);
router.get('/hackathon/:hackathonId', protect, getHackathonTeams);

router.get('/:id', protect, getTeamById);
router.post('/:id/leave', protect, authorize('participant'), leaveTeam);
router.delete('/:id/members/:memberId', protect, authorize('participant'), removeMember);
router.put('/:id/transfer', protect, authorize('participant'), transferLeadership);
router.delete('/:id', protect, authorize('participant'), deleteTeam);
router.put('/:id/status', protect, authorize('organizer', 'admin'), updateRegistrationStatus);

module.exports = router;
