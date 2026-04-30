import { parseAiJson } from '../utils/parseResponse';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const MODEL = (import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile').trim();
const MODEL_URL = 'https://api.groq.com/openai/v1/chat/completions';
const ROLE_SUGGESTION_LIMIT = 24;

function ensureApiKey() {
  if (!API_KEY || API_KEY === 'your_key_here') {
    throw new Error('Add VITE_GROQ_API_KEY to .env to use Groq AI.');
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

async function callGroq(prompt) {
  ensureApiKey();

  const response = await fetch(MODEL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'Return only valid JSON. Do not include markdown or explanations.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_completion_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    let message = `Groq request failed with status ${response.status}.`;
    try {
      const errorData = await response.json();
      message = errorData?.error?.message || message;
    } catch {
      message = response.statusText || message;
    }
    if (response.status === 404 || response.status === 403) {
      message = `${message} Check VITE_GROQ_MODEL in .env or use a model available to your Groq project.`;
    }
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Groq did not return any text content.');
  }

  return parseAiJson(text, 'Groq');
}

export async function suggestRoles(stream, skills) {
  const prompt = `You are a career counselor. The user is a student from ${stream} stream with these skills: ${skills.join(
    ', '
  )}. Suggest exactly ${ROLE_SUGGESTION_LIMIT} realistic career roles. Include a balanced mix: common beginner-friendly roles, general high-demand roles, specialized roles, creative cross-domain roles, and unique future-facing roles. Avoid duplicates and make every role practical for the user's stream and skills. Keep descriptions under 18 words. Return ONLY a valid JSON object, no markdown, no explanation: {"roles": [{role: string, description: string, demandLevel: 'High'|'Medium'|'Low', category: 'General'|'Specialized'|'Unique'}]}`;

  const parsed = await callGroq(prompt);
  const roles = Array.isArray(parsed) ? parsed : parsed?.roles;

  if (!Array.isArray(roles)) {
    throw new Error('Role suggestions must be returned as a JSON array.');
  }

  return roles.slice(0, ROLE_SUGGESTION_LIMIT).map((item) => ({
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

  const parsed = await callGroq(prompt);

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
