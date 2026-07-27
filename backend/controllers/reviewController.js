const Review = require('../models/Review');
const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');

// @desc    Submit evaluation for a project
// @route   POST /api/reviews
// @access  Private (Judge only)
exports.submitReview = async (req, res) => {
  try {
    const { submissionId, scores, feedback } = req.body;

    const submission = await Submission.findById(submissionId).populate('hackathon');
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const hackathon = submission.hackathon;

    // Verify caller is an assigned judge
    const isAssigned = hackathon.judges.some(judgeId => judgeId.toString() === req.user.id);
    if (!isAssigned && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned as a judge for this hackathon'
      });
    }

    // Validate scores against hackathon criteria limits
    for (const item of scores) {
      const criterion = hackathon.judgingCriteria.find(c => c.name === item.criterionName);
      if (!criterion) {
        return res.status(400).json({
          success: false,
          message: `Criterion '${item.criterionName}' is not defined for this hackathon`
        });
      }
      if (item.score > criterion.maxScore) {
        return res.status(400).json({
          success: false,
          message: `Score for '${item.criterionName}' cannot exceed maximum allowed of ${criterion.maxScore}`
        });
      }
    }

    // Check if review already exists from this judge for this submission
    let review = await Review.findOne({ submission: submissionId, judge: req.user.id });

    if (review) {
      // Update existing review
      review.scores = scores;
      review.feedback = feedback || review.feedback;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        submission: submissionId,
        judge: req.user.id,
        scores,
        feedback
      });
    }

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a single submission
// @route   GET /api/reviews/submission/:submissionId
// @access  Private
exports.getSubmissionReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ submission: req.params.submissionId })
      .populate('judge', 'name email');

    res.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assigned submissions for the logged in judge
// @route   GET /api/reviews/assigned
// @access  Private (Judge only)
exports.getAssignedSubmissions = async (req, res) => {
  try {
    // Find all hackathons where user is listed as judge
    const hackathons = await Hackathon.find({ judges: req.user.id });
    const hackathonIds = hackathons.map(h => h._id);

    // Get submissions for those hackathons
    const submissions = await Submission.find({ hackathon: { $in: hackathonIds } })
      .populate('team')
      .populate('hackathon');

    // Get reviews submitted by this judge to check which are completed
    const completedReviews = await Review.find({ judge: req.user.id });
    const completedSubIds = completedReviews.map(r => r.submission.toString());

    // Map to include evaluation status
    const data = submissions.map(sub => {
      const isEvaluated = completedSubIds.includes(sub._id.toString());
      const reviewDetails = isEvaluated ? completedReviews.find(r => r.submission.toString() === sub._id.toString()) : null;
      return {
        ...sub.toObject(),
        evaluated: isEvaluated,
        score: reviewDetails ? reviewDetails.totalScore : null
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard for a hackathon
// @route   GET /api/reviews/leaderboard/:hackathonId
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    // Find all submissions for the hackathon
    const submissions = await Submission.find({ hackathon: req.params.hackathonId })
      .populate('team')
      .populate('hackathon');

    const leaderboard = [];

    for (const sub of submissions) {
      const reviews = await Review.find({ submission: sub._id });
      
      let totalScoreSum = 0;
      let count = reviews.length;

      if (count > 0) {
        totalScoreSum = reviews.reduce((sum, r) => sum + r.totalScore, 0);
      }

      // We rank by average score if multiple judges evaluate, or sum.
      // Average score is cleaner. Let's provide average score and total count.
      const score = count > 0 ? Number((totalScoreSum / count).toFixed(2)) : 0;

      leaderboard.push({
        teamId: sub.team ? sub.team._id : null,
        teamName: sub.team ? sub.team.name : 'Unknown Team',
        projectName: sub.projectName,
        submissionId: sub._id,
        averageScore: score,
        reviewsCount: count,
        status: sub.status
      });
    }

    // Sort by averageScore descending
    leaderboard.sort((a, b) => b.averageScore - a.averageScore);

    // Assign rank
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item
    }));

    res.json({
      success: true,
      data: rankedLeaderboard
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
