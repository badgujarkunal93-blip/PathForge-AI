import { parseGeminiJson } from '../utils/parseResponse';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = (import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash')
  .trim()
  .replace(/^models\//, '');
const MODEL_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const ROLE_SUGGESTION_LIMIT = 24;

function ensureApiKey() {
  if (!API_KEY || API_KEY === 'your_key_here') {
    throw new Error('Add VITE_GEMINI_API_KEY to .env to use Gemini AI.');
  }
}

function normalizeDemandLevel(level) {
  const cleanLevel = String(level || '').toLowerCase();
  if (cleanLevel.includes('high')) return 'High';
  if (cleanLevel.includes('low')) return 'Low';
  return 'Medium';
}

function normalizeRoleCategory(category) {
  const cleanCategory = String(category || '').toLowerCase();
  if (cleanCategory.includes('unique') || cleanCategory.includes('future')) {
    return 'Unique';
  }
  if (cleanCategory.includes('special') || cleanCategory.includes('niche')) {
    return 'Specialized';
  }
  return 'General';
}

async function callGemini(prompt) {
  ensureApiKey();

  const response = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    let message = `Gemini request failed with status ${response.status}.`;
    try {
      const errorData = await response.json();
      message = errorData?.error?.message || message;
    } catch {
      message = response.statusText || message;
    }
    if (response.status === 404) {
      message = `${message} Check VITE_GEMINI_MODEL in .env or use a model listed for your API key.`;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('');

  if (!text) {
    throw new Error('Gemini did not return any text content.');
  }

  return parseGeminiJson(text);
}

export async function suggestRoles(stream, skills) {
  const prompt = `You are a career counselor. The user is a student from ${stream} stream with these skills: ${skills.join(
    ', '
  )}. Suggest exactly ${ROLE_SUGGESTION_LIMIT} realistic career roles. Include a balanced mix: common beginner-friendly roles, general high-demand roles, specialized roles, creative cross-domain roles, and unique future-facing roles. Avoid duplicates and make every role practical for the user's stream and skills. Keep descriptions under 18 words. Return ONLY a valid JSON array, no markdown, no explanation: [{role: string, description: string, demandLevel: 'High'|'Medium'|'Low', category: 'General'|'Specialized'|'Unique'}]`;

  const parsed = await callGemini(prompt);

  if (!Array.isArray(parsed)) {
    throw new Error('Role suggestions must be returned as a JSON array.');
  }

  return parsed.slice(0, ROLE_SUGGESTION_LIMIT).map((item) => ({
    role: String(item.role || 'Career Role'),
    description: String(item.description || 'A practical career path for your background.'),
    demandLevel: normalizeDemandLevel(item.demandLevel),
    category: normalizeRoleCategory(item.category),
  }));
}

export async function generateRoadmap(stream, skills, goal, duration, level) {
  const prompt = `You are an expert career coach. Generate a detailed career roadmap for a ${level} student from ${stream} stream who knows ${skills.join(
    ', '
  )} and wants to become a ${goal} in ${duration}. Return ONLY valid JSON, no markdown, no explanation: {phases: [{title: string, duration: string, milestones: [string], resources: [{name: string, url: string}], youtubeSearchQueries: [string]}]}`;

  const parsed = await callGemini(prompt);

  const phases = Array.isArray(parsed) ? parsed : parsed?.phases;

  if (!Array.isArray(phases)) {
    throw new Error('Roadmap response must contain a phases array.');
  }

  return {
    phases: phases.map((phase, index) => ({
      title: String(phase.title || `Phase ${index + 1}`),
      duration: String(phase.duration || duration),
      milestones: Array.isArray(phase.milestones)
        ? phase.milestones.map(String)
        : [],
      resources: Array.isArray(phase.resources)
        ? phase.resources.map((resource) => ({
            name: String(resource.name || 'Resource'),
            url: String(resource.url || 'https://www.google.com/search?q=learning+resource'),
          }))
        : [],
      youtubeSearchQueries: Array.isArray(phase.youtubeSearchQueries)
        ? phase.youtubeSearchQueries.map(String)
        : [],
    })),
  };
}
