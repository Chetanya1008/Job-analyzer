const express = require('express');
const router = express.Router();
const { uploadResume, getResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Upload resume (multipart form data)
router.post('/upload', protect, upload.single('resume'), uploadResume);

// Get resume by user ID
router.get('/:userId', protect, getResume);

module.exports = router;
