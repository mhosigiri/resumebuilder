export const parseJsonFromModel = <T>(raw: string): T => {
  const trimmed = raw.trim();
  const jsonStart = trimmed.indexOf('{');
  const jsonEnd = trimmed.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error('AI response did not contain JSON.');
  }

  const candidate = trimmed.substring(jsonStart, jsonEnd + 1);
  try {
    return JSON.parse(candidate) as T;
  } catch (error) {
    throw new Error(`Unable to parse AI JSON: ${(error as Error).message}`);
  }
};


