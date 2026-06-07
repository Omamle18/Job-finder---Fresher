import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini Client to prevent crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured in the environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Endpoint 1: Enrich Company Info & Generate Freshers Jobs/Recruiter details using Gemini
app.post("/api/company/enrich", async (req, res) => {
  try {
    const { companyName, address, role, candidateProfile } = req.body;
    
    if (!companyName) {
      res.status(400).json({ error: "companyName is required" });
      return;
    }

    const ai = getGemini();
    
    const prompt = `
      You are an expert tech career advisor in India specialized in guiding freshers.
      Enrich the following Google Maps company details for an Indian graduate / fresher looking for job opportunities:
      
      Company Name: ${companyName}
      Location/Address: ${address || "India"}
      Candidate Preferred Role: ${role || "Software Engineer / General Tech Role"}
      Candidate Profile: ${JSON.stringify(candidateProfile || {})}
      
      Suggest:
      1. What type of company is this (MNC, High-Growth Startup, Bootstrapped startup, or Local Service/product firm in India)? Provide a brief description of their presence/operations in India.
      2. 2-3 specific entry-level roles/roles for freshers (e.g. Associate Software Engineer, Operations Trainee, QA Analyst) typically open at this company type, along with realistic salary/CTC packages in LPA (Lakhs Per Annum).
      3. Exactly 2 realistic recruiter personas for this company in India (e.g. HR Talent Acquisition, Campus Recruiter). Provide a realistic name, realistic corporate title, a realistic business email template (e.g., hr@company.com or careers@company-india.com), and professional background.
      4. Key technical skills or interview topics they test for (e.g., SQL, Java, DSA, React, System Design basics).
      5. Practical interview preparation advice specifically for this company.
      
      Make the response clean, highly encouraging, structured, and realistic. Keep URLs or LinkedIn URLs formatted as simple placeholders like "linkedin.com/in/recruiter-profile".
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        companyType: { 
          type: Type.STRING, 
          description: "MNC, High-Growth Startup, Early-Stage Startup, or Local IT Service/Product company" 
        },
        indiaPresence: { 
          type: Type.STRING, 
          description: "Brief overview of what this company does in India and its reputation for freshers." 
        },
        fresherRoles: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              estimatedCTC: { type: Type.STRING, description: "e.g., 4 - 6 LPA, or 12 - 15 LPA" },
              difficulty: { type: Type.STRING, description: "Easy, Medium, Hard" },
              skillsNeeded: { type: Type.STRING, description: "Comma-separated key skills" }
            },
            required: ["title", "estimatedCTC", "difficulty", "skillsNeeded"]
          }
        },
        recruiters: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              title: { type: Type.STRING, description: "Position like Senior TA Partner or Campus Recruiter" },
              email: { type: Type.STRING, description: "Realistic recruiting email" },
              linkedin: { type: Type.STRING },
              introText: { type: Type.STRING, description: "Brief background context or tip about this recruiter" }
            },
            required: ["name", "title", "email", "linkedin", "introText"]
          }
        },
        interviewProcess: {
          type: Type.OBJECT,
          properties: {
            assessmentRounds: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Steps like Tech MCQ, Coding test, HR discussion" },
            typicalQuestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific topics or sample questions" },
            prepTip: { type: Type.STRING, description: "Best actionable advice for freshers targeting this company" }
          },
          required: ["assessmentRounds", "typicalQuestions", "prepTip"]
        }
      },
      required: ["companyType", "indiaPresence", "fresherRoles", "recruiters", "interviewProcess"]
    };

    const completion = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an Indian career placement expert and recruiting coordinator who helps fresh graduates find ideal entry-level roles in MNCs, startups, and local companies in India."
      }
    });

    const enrichedData = JSON.parse(completion.text || "{}");
    res.json(enrichedData);
  } catch (error: any) {
    console.error("Error in company enrichment: ", error);
    res.status(500).json({ 
      error: error.message || "Failed to enrich company details.",
      isKeyMissing: error.message?.includes("GEMINI_API_KEY")
    });
  }
});

// Endpoint 2: Generate Customized Recruiter Outreach Cold Email or LinkedIn message
app.post("/api/cover-letter", async (req, res) => {
  try {
    const { 
      candidateName, 
      candidateRole, 
      candidateSkills, 
      candidateExperience, 
      candidateEducation,
      companyName, 
      recruiterName, 
      jobTitle,
      format // "email" or "linkedin"
    } = req.body;

    const ai = getGemini();

    const prompt = `
      Create a high-impact, polite, and professional cold outreach message for an Indian fresher candidate.
      
      Candidate Details:
      - Name: ${candidateName || "A fresher jobseeker"}
      - Target Role: ${candidateRole}
      - Core Skills: ${candidateSkills || "Tech Enthusiast, Problem Solving, Computer Science Basics"}
      - Experience / Projects: ${candidateExperience || "Graduation Capstone project & academic labs"}
      - Education: ${candidateEducation || "B.Tech/B.Sc/BCA/MCA Graduate from India"}
      
      Company & Recruiter Details:
      - Company Name: ${companyName}
      - Recruiter Name: ${recruiterName || "Talent Acquisition Team"}
      - Target Job/Role: ${jobTitle || "Graduate Engineering Trainee / Associate"}
      
      Output format: ${format === "linkedin" ? "LinkedIn Connection InMail (under 300 characters, extremely short, catchy, action-oriented)" : "Professional Cold Email (subject line, salutation, 3 short value-first paragraphs, call-to-action, high-contrast formatting)"}.
      
      Make sure to use natural, respectful Indian corporate communication standards. Use placeholder fields where the candidate should add custom links (like portfolio, github, resume link) in square brackets like [Portfolio Link] or [Resume Link].
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        subjectLine: { type: Type.STRING, description: "Email subject line, leave blank if LinkedIn" },
        messageBody: { type: Type.STRING, description: "The drafted outreach message with custom brackets for links" },
        proTips: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 short actionable tips on when to send this and how to follow up" }
      },
      required: ["messageBody", "proTips"]
    };

    const completion = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an elite corporate Recruiter and resume writer in India. You know exactly what templates catch HR's attention in crowded inboxes for freshers."
      }
    });

    const letterData = JSON.parse(completion.text || "{}");
    res.json(letterData);
  } catch (error: any) {
    console.error("Error in outreach draft: ", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate outreach draft.",
      isKeyMissing: error.message?.includes("GEMINI_API_KEY") 
    });
  }
});

// Configure Vite or Static Asset File Serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer server with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving static production assets...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
