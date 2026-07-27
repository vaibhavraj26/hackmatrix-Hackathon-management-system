const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  projectName: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true
  },
  problemStatement: {
    type: String,
    required: [true, 'Please add the problem statement']
  },
  solution: {
    type: String,
    required: [true, 'Please add the solution details']
  },
  description: {
    type: String,
    default: ''
  },
  githubUrl: {
    type: String,
    required: [true, 'Please add the GitHub repository link']
  },
  demoUrl: {
    type: String,
    default: ''
  },
  techStack: {
    type: [String],
    default: []
  },
  presentationUrl: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  screenshots: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Submission', SubmissionSchema);
