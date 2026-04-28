const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extract text from PDF or DOCX buffer
 * @param {Buffer} buffer - File buffer
 * @param {string} fileName - Original file name (to detect type)
 * @returns {Promise<{text: string, fileType: string}>}
 */
const extractTextFromFile = async (buffer, fileName) => {
  const ext = path.extname(fileName).toLowerCase();

  if (ext === '.pdf') {
    const data = await pdfParse(buffer);
    return { text: data.text, fileType: 'pdf' };
  } else if (ext === '.docx') {
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, fileType: 'docx' };
  } else {
    throw new Error('Unsupported file type. Only PDF and DOCX are accepted.');
  }
};

module.exports = { extractTextFromFile };
