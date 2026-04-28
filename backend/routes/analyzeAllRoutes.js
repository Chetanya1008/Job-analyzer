const express = require('express');
const router = express.Router();
const { analyzeAll } = require('../controllers/analyzeAllController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// POST /api/analyze-all
// Accepts: multipart/form-data { resume: File, jobDescription: string }
router.post('/', protect, upload.single('resume'), analyzeAll);

module.exports = router;
