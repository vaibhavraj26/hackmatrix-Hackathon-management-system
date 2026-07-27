const User = require('../models/User');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');

// @desc    Get platform-wide analytics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });
    const organizerCount = await User.countDocuments({ role: 'organizer' });
    const participantCount = await User.countDocuments({ role: 'participant' });
    const judgeCount = await User.countDocuments({ role: 'judge' });

    const totalHackathons = await Hackathon.countDocuments();
    const totalTeams = await Team.countDocuments();
    const totalSubmissions = await Submission.countDocuments();

    // Latest items
    const latestHackathons = await Hackathon.find()
      .populate('organizer', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const latestUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admin: adminCount,
          organizer: organizerCount,
          participant: participantCount,
          judge: judgeCount
        },
        hackathons: totalHackathons,
        teams: totalTeams,
        submissions: totalSubmissions,
        latestHackathons,
        latestUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users on the platform
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, isBlocked } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    if (isBlocked !== undefined) {
      user.isBlocked = isBlocked;
    }

    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot delete another Admin' });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle block/unblock status of a user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin only)
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'You cannot block an Admin' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: `User successfully ${user.isBlocked ? 'blocked' : 'unblocked'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
