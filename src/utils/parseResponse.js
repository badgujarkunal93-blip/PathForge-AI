export function stripJsonFences(value) {
  return String(value || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

function extractLikelyJson(value) {
  const trimmed = stripJsonFences(value);
  const arrayStart = trimmed.indexOf('[');
  const arrayEnd = trimmed.lastIndexOf(']');
  const objectStart = trimmed.indexOf('{');
  const objectEnd = trimmed.lastIndexOf('}');

  if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
    if (arrayStart === -1 || objectStart < arrayStart) {
      return trimmed.slice(objectStart, objectEnd + 1);
    }
  }

  if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  return trimmed;
}

export function parseAiJson(value, providerName = 'AI') {
  const cleaned = extractLikelyJson(value);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(
      `${providerName} returned a response that was not valid JSON. ${error.message}`
    );
  }
}

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return 'Today';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function uniqueValues(values) {
  return [...new Set(values.filter(Boolean).map((value) => String(value).trim()))];
}
