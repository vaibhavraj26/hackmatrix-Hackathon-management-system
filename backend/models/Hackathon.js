const mongoose = require('mongoose');

const JudgingCriteriaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  maxScore: {
    type: Number,
    required: true,
    default: 10
  }
});

const HackathonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a hackathon title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  theme: {
    type: String,
    required: [true, 'Please add a theme (e.g., FinTech, AI, Web3)']
  },
  mode: {
    type: String,
    enum: ['online', 'offline'],
    default: 'online'
  },
  venue: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Please add a registration deadline']
  },
  banner: {
    type: String,
    default: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80'
  },
  prizePool: {
    type: Number,
    default: 0
  },
  maxTeamSize: {
    type: Number,
    required: [true, 'Please add maximum team size'],
    default: 4,
    min: [1, 'Team size must be at least 1']
  },
  rules: {
    type: [String],
    default: []
  },
  judgingCriteria: {
    type: [JudgingCriteriaSchema],
    default: [
      { name: 'Innovation', maxScore: 10 },
      { name: 'Technical Complexity', maxScore: 10 },
      { name: 'User Interface', maxScore: 10 },
      { name: 'Functionality', maxScore: 10 },
      { name: 'Scalability', maxScore: 10 },
      { name: 'Presentation', maxScore: 10 }
    ]
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  judges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hackathon', HackathonSchema);
