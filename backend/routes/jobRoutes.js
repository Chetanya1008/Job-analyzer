const express = require('express');
const router = express.Router();
const { analyzeJob, listJobs, getJob } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeJob);
router.get('/list', protect, listJobs);
router.get('/:jobId', protect, getJob);

module.exports = router;
