const mongoose = require('mongoose');
const crypto = require('crypto');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true
  },
  hackathon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hackathon',
    required: true
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  inviteCode: {
    type: String,
    unique: true
  },
  registrationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate unique invite code before saving
TeamSchema.pre('save', async function(next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  }
  next();
});

module.exports = mongoose.model('Team', TeamSchema);
