const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

// @desc    Create a new hackathon
// @route   POST /api/hackathons
// @access  Private (Organizer only)
exports.createHackathon = async (req, res) => {
  try {
    const {
      title,
      description,
      theme,
      mode,
      venue,
      startDate,
      endDate,
      registrationDeadline,
      banner,
      prizePool,
      maxTeamSize,
      rules,
      judgingCriteria
    } = req.body;

    // Date validations
    if (new Date(registrationDeadline) > new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline must be before the start date'
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before the end date'
      });
    }

    const hackathon = await Hackathon.create({
      title,
      description,
      theme,
      mode,
      venue,
      startDate,
      endDate,
      registrationDeadline,
      banner,
      prizePool,
      maxTeamSize,
      rules,
      judgingCriteria,
      organizer: req.user.id
    });

    res.status(201).json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all hackathons (with filters and search)
// @route   GET /api/hackathons
// @access  Public
exports.getHackathons = async (req, res) => {
  try {
    const { search, mode, theme, status, registrationOpen } = req.query;
    let query = {};

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Mode filter
    if (mode && mode !== 'all') {
      query.mode = mode;
    }

    // Theme filter
    if (theme && theme !== 'all') {
      query.theme = { $regex: theme, $options: 'i' };
    }

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Registration open filter
    if (registrationOpen === 'true') {
      query.registrationDeadline = { $gte: new Date() };
    } else if (registrationOpen === 'false') {
      query.registrationDeadline = { $lt: new Date() };
    }

    const hackathons = await Hackathon.find(query)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: hackathons.length,
      data: hackathons
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hackathon details
// @route   GET /api/hackathons/:id
// @access  Public
exports.getHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('judges', 'name email profile');

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    res.json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a hackathon
// @route   PUT /api/hackathons/:id
// @access  Private (Organizer only)
exports.updateHackathon = async (req, res) => {
  try {
    let hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check ownership
    if (hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this hackathon'
      });
    }

    // Date validations if being updated
    const start = req.body.startDate || hackathon.startDate;
    const end = req.body.endDate || hackathon.endDate;
    const deadline = req.body.registrationDeadline || hackathon.registrationDeadline;

    if (new Date(deadline) > new Date(start)) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline must be before the start date'
      });
    }

    if (new Date(start) > new Date(end)) {
      return res.status(400).json({
        success: false,
        message: 'Start date must be before the end date'
      });
    }

    hackathon = await Hackathon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a hackathon
// @route   DELETE /api/hackathons/:id
// @access  Private (Organizer or Admin)
exports.deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check ownership
    if (hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this hackathon'
      });
    }

    await hackathon.deleteOne();

    res.json({
      success: true,
      message: 'Hackathon deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign judges to hackathon
// @route   PUT /api/hackathons/:id/judges
// @access  Private (Organizer or Admin)
exports.assignJudges = async (req, res) => {
  try {
    const { judgeIds } = req.body; // Array of user IDs
    const hackathon = await Hackathon.findById(req.params.id);

    if (!hackathon) {
      return res.status(404).json({ success: false, message: 'Hackathon not found' });
    }

    // Check ownership
    if (hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to assign judges for this hackathon'
      });
    }

    // Verify all judgeIds have role 'judge'
    const judges = await User.find({ _id: { $in: judgeIds }, role: 'judge' });
    if (judges.length !== judgeIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Some of the assigned users are not registered as judges'
      });
    }

    hackathon.judges = judgeIds;
    await hackathon.save();

    res.json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all available judges in the platform
// @route   GET /api/hackathons/judges/all
// @access  Private (Organizer or Admin)
exports.getAvailableJudges = async (req, res) => {
  try {
    const judges = await User.find({ role: 'judge', isBlocked: false }).select('name email profile');
    res.json({
      success: true,
      data: judges
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
