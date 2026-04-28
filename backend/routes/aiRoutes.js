const express = require('express');
const router = express.Router();
const { analyzeSkillGap, generateInterviewQuestions, optimizeResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/skill-gap', protect, analyzeSkillGap);
router.post('/interview-questions', protect, generateInterviewQuestions);
router.post('/optimize-resume', protect, optimizeResume);

module.exports = router;
