const mongoose = require('mongoose');

const skillSwapSchema = new mongoose.Schema({
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requesterSkill: {
    type: String,
    required: true
  },
  recipientSkill: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'withdrawn', 'completed'],
    default: 'pending'
  },
  requestMessage: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Only revealed after acceptance
  contactDetails: {
    requesterEmail: { type: String },
    recipientEmail: { type: String }
  },
  // For tracking learning progress
  learningProgress: {
    requesterFeedback: { type: String },
    recipientFeedback: { type: String },
    sessionsCompleted: { type: Number, default: 0 }
  }
});

// Update timestamps on save
skillSwapSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create indexes for efficient querying
skillSwapSchema.index({ requesterId: 1, status: 1 });
skillSwapSchema.index({ recipientId: 1, status: 1 });

module.exports = mongoose.model('SkillSwap', skillSwapSchema); 