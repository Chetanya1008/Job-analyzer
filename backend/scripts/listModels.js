const { GoogleGenAI } = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

(async () => {
  try {
    console.log("🔍 Fetching available models...\n");

    const response = await ai.models.list();

    // 🔥 FIX: access models array correctly
    const models = response.models || [];

    models.forEach((model) => {
      console.log(model.name);
    });

    console.log("\n✅ Done");
  } catch (error) {
    console.error("❌ Error fetching models:", error);
  }
})();