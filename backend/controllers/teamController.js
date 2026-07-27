const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

// @desc    Create a team for a hackathon
// @route   POST /api/teams
// @access  Private (Participant only)
exports.createTeam = async (req, res) => {
  try {
    const { name, hackathonId } = req.body;

    const hackathon = await Hackathon.findById(hackathonId);
    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check if registration deadline has passed
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed. Cannot create a team.'
      });
    }

    // Check if user already registered for this hackathon (either as leader or member)
    const existingRegistration = await Team.findOne({
      hackathon: hackathonId,
      $or: [
        { leader: req.user.id },
        { members: req.user.id }
      ]
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered/joined a team for this hackathon'
      });
    }

    const team = await Team.create({
      name,
      hackathon: hackathonId,
      leader: req.user.id,
      members: [req.user.id] // Leader is automatically a member
    });

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Join a team using Invite Code
// @route   POST /api/teams/join
// @access  Private (Participant only)
exports.joinTeam = async (req, res) => {
  try {
    const { inviteCode } = req.body;

    // Find team by invite code
    const team = await Team.findOne({ inviteCode }).populate('hackathon');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Invalid Invite Code' });
    }

    const hackathon = team.hackathon;

    // Check if registration deadline has passed
    if (new Date() > new Date(hackathon.registrationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed. Cannot join team.'
      });
    }

    // Check if team is full
    if (team.members.length >= hackathon.maxTeamSize) {
      return res.status(400).json({
        success: false,
        message: `Team is full. Max team size is ${hackathon.maxTeamSize}`
      });
    }

    // Check if user already registered for this hackathon
    const existingRegistration = await Team.findOne({
      hackathon: hackathon._id,
      $or: [
        { leader: req.user.id },
        { members: req.user.id }
      ]
    });

    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: 'You have already registered/joined a team for this hackathon'
      });
    }

    // Add user to team members
    team.members.push(req.user.id);
    await team.save();

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Leave a team
// @route   POST /api/teams/:id/leave
// @access  Private (Participant only)
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    const isMember = team.members.includes(req.user.id);
    if (!isMember) {
      return res.status(400).json({ success: false, message: 'You are not in this team' });
    }

    // If leader is leaving
    if (team.leader.toString() === req.user.id) {
      if (team.members.length > 1) {
        return res.status(400).json({
          success: false,
          message: 'Please transfer leadership to another member before leaving the team'
        });
      } else {
        // If leader is the only member, delete the team
        await team.deleteOne();
        return res.json({
          success: true,
          message: 'You left the team. The team has been deleted since there were no other members.'
        });
      }
    }

    // Remove user from members array
    team.members = team.members.filter(memberId => memberId.toString() !== req.user.id);
    await team.save();

    res.json({
      success: true,
      message: 'Successfully left the team'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove a member from the team
// @route   DELETE /api/teams/:id/members/:memberId
// @access  Private (Leader only)
exports.removeMember = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if requester is leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leaders can remove members' });
    }

    const memberId = req.params.memberId;
    if (memberId === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot remove yourself. Use leave instead.' });
    }

    // Remove member from array
    team.members = team.members.filter(id => id.toString() !== memberId);
    await team.save();

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Transfer team leadership
// @route   PUT /api/teams/:id/transfer
// @access  Private (Leader only)
exports.transferLeadership = async (req, res) => {
  try {
    const { newLeaderId } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the leader can transfer leadership' });
    }

    // Verify new leader is a member
    if (!team.members.includes(newLeaderId)) {
      return res.status(400).json({ success: false, message: 'New leader must be a member of the team' });
    }

    team.leader = newLeaderId;
    await team.save();

    res.json({
      success: true,
      message: 'Leadership transferred successfully',
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a team
// @route   DELETE /api/teams/:id
// @access  Private (Leader only)
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only team leaders can delete the team' });
    }

    await team.deleteOne();

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve or Reject registration (Organizer or Admin only)
// @route   PUT /api/teams/:id/status
// @access  Private (Organizer/Admin only)
exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const team = await Team.findById(req.params.id).populate('hackathon');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify organizer of hackathon or admin
    if (team.hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change registration status for this hackathon'
      });
    }

    team.registrationStatus = status;
    await team.save();

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all teams for a specific hackathon
// @route   GET /api/teams/hackathon/:hackathonId
// @access  Private
exports.getHackathonTeams = async (req, res) => {
  try {
    const teams = await Team.find({ hackathon: req.params.hackathonId })
      .populate('leader', 'name email profile')
      .populate('members', 'name email profile');

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's teams
// @route   GET /api/teams/my
// @access  Private
exports.getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { leader: req.user.id },
        { members: req.user.id }
      ]
    })
    .populate('hackathon')
    .populate('leader', 'name email')
    .populate('members', 'name email');

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('hackathon')
      .populate('leader', 'name email profile')
      .populate('members', 'name email profile');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
