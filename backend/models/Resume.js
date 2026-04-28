const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    // Structured data extracted from resume
    skills: [String],
    experience: [String],
    education: [String],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
