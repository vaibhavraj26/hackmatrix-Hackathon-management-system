const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
  criterionName: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  }
});

const ReviewSchema = new mongoose.Schema({
  submission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
    required: true
  },
  judge: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scores: [ScoreSchema],
  feedback: {
    type: String,
    default: ''
  },
  totalScore: {
    type: Number
  }
}, {
  timestamps: true
});

// Calculate total score before saving
ReviewSchema.pre('save', function(next) {
  if (this.scores && this.scores.length > 0) {
    this.totalScore = this.scores.reduce((sum, item) => sum + item.score, 0);
  } else {
    this.totalScore = 0;
  }
  next();
});

// Add index to prevent a judge from reviewing the same submission multiple times
ReviewSchema.index({ submission: 1, judge: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);
