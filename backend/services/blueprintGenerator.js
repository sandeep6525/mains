import { GoogleGenAI } from '@google/genai';

export async function generateBlueprintProposal(params) {
  const { questionText, paperCode, year, marks, wordLimit, topicId, topicTitle, directive } = params;

  if (!topicId || !topicTitle || topicTitle === 'TOPIC_MAPPING_PENDING') {
    return {
      status: "INSUFFICIENT_CONTEXT",
      reason: "An approved topic mapping is required to generate a blueprint."
    };
  }

  if (!paperCode || paperCode === 'UNKNOWN') {
    return {
      status: "INSUFFICIENT_CONTEXT",
      reason: "A valid paper code is required to generate a blueprint."
    };
  }

  if (!questionText) {
    return {
      status: "INSUFFICIENT_CONTEXT",
      reason: "Question text is required to generate a blueprint."
    };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      status: "ERROR",
      reason: "API Key not configured. Unable to generate blueprint."
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

    const prompt = `You are generating an answer-writing blueprint proposal for a UPSC Mains question.

Inputs:
- Question Text: ${questionText}
- Paper Code: ${paperCode}
- Year: ${year}
- Marks: ${marks}
- Word Limit: ${wordLimit}
- Syllabus Topic ID: ${topicId}
- Syllabus Topic Title: ${topicTitle}
- Existing Directive: ${directive || 'None'}

Rules:
- Do not invent the question.
- Do not change marks.
- Do not change word limit.
- Do not invent a syllabus topic.
- Use the supplied approved topic.
- Produce a structured answer blueprint suitable for Mains answer writing.
- Keep the result suitable for Mains answer writing.
- Return only the required structured output in JSON.`;

    const responseSchema = {
      type: "OBJECT",
      properties: {
        directive: { type: "STRING" },
        directive_tip: { type: "STRING" },
        model_framework: {
          type: "OBJECT",
          properties: {
            introduction: { type: "STRING" },
            dimensions: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  name: { type: "STRING" },
                  points: {
                    type: "ARRAY",
                    items: { type: "STRING" }
                  }
                },
                required: ["name", "points"]
              }
            },
            citations: {
              type: "ARRAY",
              items: { type: "STRING" }
            },
            conclusion: { type: "STRING" }
          },
          required: ["introduction", "dimensions", "citations", "conclusion"]
        }
      },
      required: ["directive", "directive_tip", "model_framework"]
    };

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI provider");
    }

    const parsed = JSON.parse(text);

    // Validate structure matches requirements
    if (
      !parsed.directive || 
      !parsed.directive_tip || 
      !parsed.model_framework || 
      !parsed.model_framework.introduction || 
      !Array.isArray(parsed.model_framework.dimensions) || 
      !Array.isArray(parsed.model_framework.citations) || 
      !parsed.model_framework.conclusion
    ) {
      throw new Error("AI returned a malformed blueprint structure.");
    }

    return {
      status: "PROPOSED",
      proposal: parsed
    };
  } catch (error) {
    console.error("Blueprint generation failed:", error);
    return {
      status: "ERROR",
      reason: error.message || "Unable to generate blueprint proposal."
    };
  }
}
