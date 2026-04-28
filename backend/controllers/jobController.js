const Job = require('../models/Job');
const { scrapeJobDescription } = require('../utils/scraper');

/**
 * @route  POST /api/job/analyze
 * @desc   Submit a job URL or manual text for storage and analysis
 * @access Private
 */
const analyzeJob = async (req, res) => {
  try {
    const { url, manualText, title, company } = req.body;

    if (!url && !manualText) {
      return res.status(400).json({
        success: false,
        message: 'Either a job URL or manual job description text is required',
      });
    }

    let jobText = '';
    let sourceUrl = '';

    if (url) {
      // Scrape job description from URL using Puppeteer
      try {
        jobText = await scrapeJobDescription(url);
        sourceUrl = url;
      } catch (scrapeError) {
        return res.status(422).json({
          success: false,
          message: `Scraping failed: ${scrapeError.message}. Try pasting the job description manually.`,
        });
      }
    } else {
      jobText = manualText;
    }

    if (jobText.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message: 'Job description is too short. Please provide more details.',
      });
    }

    // Save job to database
    const job = await Job.create({
      userId: req.user._id,
      title: title || 'Job Opportunity',
      company: company || '',
      sourceUrl,
      rawText: jobText.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Job description saved successfully',
      data: {
        id: job._id,
        title: job.title,
        company: job.company,
        sourceUrl: job.sourceUrl,
        textPreview: job.rawText.substring(0, 300) + '...',
        charCount: job.rawText.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route  GET /api/job/list
 * @desc   Get all jobs for the current user
 * @access Private
 */
const listJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.user._id })
      .select('title company sourceUrl createdAt skillGapAnalysis interviewQuestions optimizedResume')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @route  GET /api/job/:jobId
 * @desc   Get a single job by ID
 * @access Private
 */
const getJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.jobId, userId: req.user._id });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { analyzeJob, listJobs, getJob };
