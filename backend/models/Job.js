const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Job',
    },
    company: {
      type: String,
      default: '',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    rawText: {
      type: String,
      required: true,
    },
    // Analysis results
    skillGapAnalysis: {
      matchingSkills: [String],
      missingSkills: [String],
      suggestions: [String],
      matchScore: Number,
    },
    interviewQuestions: {
      technical: [String],
      hr: [String],
    },
    optimizedResume: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
