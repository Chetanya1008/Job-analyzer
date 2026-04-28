const { getGeminiResponse } = require('../config/gemini');
const Resume = require('../models/Resume');
const Job = require('../models/Job');

/**
 * Helper: Call Gemini with a prompt and return text response
 */
const callGemini = async (prompt) => {
  const model = getGeminiModel();
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

/**
 * Helper: Parse JSON from Gemini response (handles markdown fences)
 */
const parseGeminiJSON = (text) => {
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
};

/**
 * @route  POST /api/ai/skill-gap
 * @desc   Analyze skill gap between resume and job description
 * @access Private
 */
const analyzeSkillGap = async (req, res) => {
  try {
    const { jobId } = req.body;

    // Fetch resume and job
    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Please upload your resume first.' });
    }

    const job = await Job.findOne({ _id: jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const prompt = `
You are an expert career coach and ATS specialist. 
Analyze the following resume and job description, then return a structured skill gap analysis.

RESUME:
${resume.rawText.substring(0, 3000)}

JOB DESCRIPTION:
${job.rawText.substring(0, 3000)}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "matchScore": <number 0-100>,
  "matchingSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "suggestions": ["actionable suggestion 1", "actionable suggestion 2", ...]
}

matchScore: percentage of how well the resume matches the job.
matchingSkills: skills present in both resume and job description.
missingSkills: skills required by job but missing from resume.
suggestions: 4-6 concrete, actionable steps to improve the candidacy.
`;

    const raw = await getGeminiResponse(prompt);
    const analysis = parseGeminiJSON(raw);

    // Save analysis back to job document
    job.skillGapAnalysis = {
      matchingSkills: analysis.matchingSkills || [],
      missingSkills: analysis.missingSkills || [],
      suggestions: analysis.suggestions || [],
      matchScore: analysis.matchScore || 0,
    };
    await job.save();

    res.json({
      success: true,
      message: 'Skill gap analysis complete',
      data: job.skillGapAnalysis,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `AI analysis failed: ${error.message}` });
  }
};

/**
 * @route  POST /api/ai/interview-questions
 * @desc   Generate technical and HR interview questions
 * @access Private
 */
const generateInterviewQuestions = async (req, res) => {
  try {
    const { jobId } = req.body;

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Please upload your resume first.' });
    }

    const job = await Job.findOne({ _id: jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const prompt = `
You are an expert technical interviewer and HR specialist.
Based on the resume and job description below, generate realistic interview questions.

RESUME:
${resume.rawText.substring(0, 2000)}

JOB DESCRIPTION:
${job.rawText.substring(0, 2000)}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{
  "technical": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?",
    "Question 6?",
    "Question 7?"
  ],
  "hr": [
    "Question 1?",
    "Question 2?",
    "Question 3?",
    "Question 4?",
    "Question 5?"
  ]
}

Generate 7 technical questions specific to the technologies and role, 
and 5 behavioral/HR questions. Make them challenging and relevant.
`;

   const raw = await getGeminiResponse(prompt);
    const questions = parseGeminiJSON(raw);

    // Save questions to job document
    job.interviewQuestions = {
      technical: questions.technical || [],
      hr: questions.hr || [],
    };
    await job.save();

    res.json({
      success: true,
      message: 'Interview questions generated',
      data: job.interviewQuestions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Question generation failed: ${error.message}` });
  }
};

/**
 * @route  POST /api/ai/optimize-resume
 * @desc   Optimize resume for ATS based on job description
 * @access Private
 */
const optimizeResume = async (req, res) => {
  try {
    const { jobId } = req.body;

    const resume = await Resume.findOne({ userId: req.user._id });
    if (!resume) {
      return res.status(404).json({ success: false, message: 'No resume found. Please upload your resume first.' });
    }

    const job = await Job.findOne({ _id: jobId, userId: req.user._id });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    const prompt = `
You are an expert ATS (Applicant Tracking System) resume optimizer and professional resume writer.

Rewrite and optimize the following resume specifically for the job description provided.

ORIGINAL RESUME:
${resume.rawText.substring(0, 3000)}

TARGET JOB DESCRIPTION:
${job.rawText.substring(0, 2000)}

Instructions:
1. Incorporate relevant keywords from the job description naturally
2. Reorder and emphasize experiences that match the job requirements
3. Quantify achievements where possible (use realistic estimates if exact numbers aren't available)
4. Use action verbs and industry-standard terminology
5. Ensure ATS-friendly formatting (clear sections, standard headings)
6. Keep the same person's actual experience - don't fabricate new roles or degrees
7. Make it concise and impactful

Return ONLY the optimized resume text. No explanations, no JSON, just the resume content.
Start directly with the person's name or professional summary.
`;

    const optimizedText = await callGemini(prompt);

    // Save optimized resume to job document
    job.optimizedResume = optimizedText.trim();
    await job.save();

    res.json({
      success: true,
      message: 'Resume optimized for ATS',
      data: {
        optimizedResume: job.optimizedResume,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: `Resume optimization failed: ${error.message}` });
  }
};

module.exports = { analyzeSkillGap, generateInterviewQuestions, optimizeResume };
