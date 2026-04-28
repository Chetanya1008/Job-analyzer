const gemini = require('../config/gemini'); // ✅ IMPORTANT CHANGE
const { extractTextFromFile } = require('../utils/textExtractor');

// ✅ Safe JSON parser
const parseGeminiJSON = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }

    return JSON.parse(cleaned.substring(start, end + 1));

  } catch (err) {
    console.error("❌ JSON PARSE ERROR:", text);

    return null; // fallback
  }
};

const analyzeAll = async (req, res) => {
  try {
    console.log("Gemini object:", gemini); // 🔍 debug

    // 1. Validate
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume required' });
    }

    const jobDescription = req.body.jobDescription?.trim();
    if (!jobDescription) {
      return res.status(400).json({ success: false, message: 'Job description required' });
    }

    // 2. Extract resume
    const extracted = await extractTextFromFile(req.file.buffer, req.file.originalname);
    const resumeText = extracted.text;

    const resumeSnippet = resumeText.substring(0, 3000);
    const jdSnippet = jobDescription.substring(0, 3000);

    // 3. Prompts

    const skillPrompt = `
Analyze skill gap.

RESUME:
${resumeSnippet}

JOB:
${jdSnippet}

Return ONLY JSON:
{
  "matchScore": number,
  "matchingSkills": [],
  "missingSkills": [],
  "suggestions": []
}
`;

    const interviewPrompt = `
Generate interview questions.

RESUME:
${resumeSnippet}

JOB:
${jdSnippet}

Return ONLY JSON:
{
  "technical": [],
  "hr": []
}
`;

    const atsPrompt = `
Rewrite resume for this job.

RESUME:
${resumeSnippet}

JOB:
${jdSnippet}

Return only optimized resume text.
`;

    // ✅ OpenRouter calls
    const [skillRaw, interviewRaw, atsRaw] = await Promise.all([
      gemini.getGeminiResponse(skillPrompt),
      gemini.getGeminiResponse(interviewPrompt),
      gemini.getGeminiResponse(atsPrompt),
    ]);

    // 4. Parse
    const skillGap = parseGeminiJSON(skillRaw) || {
      matchScore: 50,
      matchingSkills: [],
      missingSkills: [],
      suggestions: ["Parsing failed"]
    };

    let interview = parseGeminiJSON(interviewRaw);

if (!interview) {
  // fallback: text ko array me convert karo
  interview = {
    technical: interviewRaw.split('\n').filter(q => q.trim() !== ''),
    hr: []
  };
}

    // 5. Response
    res.json({
      success: true,
      data: {
        skillGap,
        interviewQuestions: interview,
        optimizedResume: atsRaw.trim()
      }
    });

  } catch (error) {
    console.error("❌ analyzeAll error:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { analyzeAll };