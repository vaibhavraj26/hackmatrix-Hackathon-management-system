const Submission = require('../models/Submission');
const Team = require('../models/Team');
const Hackathon = require('../models/Hackathon');

// @desc    Submit a project for a hackathon
// @route   POST /api/submissions
// @access  Private (Participant/Leader only)
exports.submitProject = async (req, res) => {
  try {
    const {
      teamId,
      projectName,
      problemStatement,
      solution,
      description,
      githubUrl,
      demoUrl,
      techStack,
      presentationUrl,
      videoUrl,
      screenshots
    } = req.body;

    const team = await Team.findById(teamId).populate('hackathon');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Verify caller is the leader
    if (team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader can submit the project'
      });
    }

    // Verify team is approved to participate
    if (team.registrationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your team registration must be approved before you can submit a project'
      });
    }

    const hackathon = team.hackathon;

    // Check if the hackathon submission deadline has passed (Hackathon end date is submission deadline)
    if (new Date() > new Date(hackathon.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'The hackathon submission deadline has passed'
      });
    }

    // Check if team already submitted a project
    const existingSubmission = await Submission.findOne({ team: teamId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'Your team has already submitted a project. Use update instead.'
      });
    }

    const submission = await Submission.create({
      team: teamId,
      hackathon: hackathon._id,
      projectName,
      problemStatement,
      solution,
      description,
      githubUrl,
      demoUrl,
      techStack,
      presentationUrl,
      videoUrl,
      screenshots,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Edit a project submission
// @route   PUT /api/submissions/:id
// @access  Private (Participant/Leader only)
exports.editSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('hackathon').populate('team');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify caller is team leader
    if (submission.team.leader.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the team leader can edit the project submission'
      });
    }

    // Check if hackathon end date (submission deadline) has passed
    if (new Date() > new Date(submission.hackathon.endDate)) {
      return res.status(400).json({
        success: false,
        message: 'The submission deadline has passed. Cannot edit submission.'
      });
    }

    const {
      projectName,
      problemStatement,
      solution,
      description,
      githubUrl,
      demoUrl,
      techStack,
      presentationUrl,
      videoUrl,
      screenshots
    } = req.body;

    submission.projectName = projectName || submission.projectName;
    submission.problemStatement = problemStatement || submission.problemStatement;
    submission.solution = solution || submission.solution;
    submission.description = description !== undefined ? description : submission.description;
    submission.githubUrl = githubUrl || submission.githubUrl;
    submission.demoUrl = demoUrl !== undefined ? demoUrl : submission.demoUrl;
    submission.techStack = techStack || submission.techStack;
    submission.presentationUrl = presentationUrl !== undefined ? presentationUrl : submission.presentationUrl;
    submission.videoUrl = videoUrl !== undefined ? videoUrl : submission.videoUrl;
    submission.screenshots = screenshots || submission.screenshots;

    await submission.save();

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get submission details
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate({
        path: 'team',
        populate: [
          { path: 'leader', select: 'name email profile' },
          { path: 'members', select: 'name email profile' }
        ]
      })
      .populate('hackathon');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for a hackathon
// @route   GET /api/submissions/hackathon/:hackathonId
// @access  Private
exports.getHackathonSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ hackathon: req.params.hackathonId })
      .populate('team')
      .sort({ submittedAt: -1 });

    res.json({
      success: true,
      count: submissions.length,
      data: submissions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update submission status (e.g. approve/reject project)
// @route   PUT /api/submissions/:id/status
// @access  Private (Organizer/Admin only)
exports.updateSubmissionStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'pending', 'under_review', 'approved', 'rejected'
    if (!['pending', 'under_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const submission = await Submission.findById(req.params.id).populate('hackathon');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Verify organizer of hackathon or admin
    if (submission.hackathon.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to change project status'
      });
    }

    submission.status = status;
    await submission.save();

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
