const Resume = require('../models/Resume');
const { extractTextFromFile } = require('../utils/textExtractor');

/**
 * @route  POST /api/resume/upload
 * @desc   Upload and parse a resume (PDF or DOCX)
 * @access Private
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { buffer, originalname } = req.file;

    // Extract text from file buffer
    const { text, fileType } = await extractTextFromFile(buffer, originalname);

    if (!text || text.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract meaningful text from the file. Ensure the file is not password-protected.',
      });
    }

    // Upsert: replace existing resume for user (one resume per user for simplicity)
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        fileName: originalname,
        fileType,
        rawText: text.trim(),
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        textPreview: resume.rawText.substring(0, 300) + '...',
        charCount: resume.rawText.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route  GET /api/resume/:userId
 * @desc   Get resume for a specific user
 * @access Private
 */
const getResume = async (req, res) => {
  try {
    // Ensure the requesting user can only access their own resume
    if (req.params.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const resume = await Resume.findOne({ userId: req.params.userId });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found for this user' });
    }

    res.json({
      success: true,
      data: {
        id: resume._id,
        fileName: resume.fileName,
        fileType: resume.fileType,
        rawText: resume.rawText,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume, getResume };
