import axios from 'axios';
import { env, assertEnv } from '../config/env';

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'input_text'; text: string }
  | { type: 'input_image'; image_base64: string; mime_type: string };

type ChatMessage = {
  role: 'system' | 'user';
  content: string | ContentPart[];
};

interface ChatCompletionPayload {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
  max_tokens?: number;
}

const extractContent = (content: string | ContentPart[] | null | undefined) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  return content
    .map((part) => {
      if ('text' in part) return part.text ?? '';
      return '';
    })
    .join('\n')
    .trim();
};

const baseHeaders = {
  Authorization: `Bearer ${env.openRouterKey}`,
  'HTTP-Referer': env.appUrl,
  'X-Title': env.appName,
};

export const createCompletion = async (payload: ChatCompletionPayload) => {
  assertEnv();
  const url = `${env.openRouterBaseUrl}/chat/completions`;
  const { data } = await axios.post(url, payload, {
    headers: baseHeaders,
  });
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('OpenRouter returned an empty response.');
  }
  return extractContent(choice);
};

export const callVisionParser = async (params: {
  prompt: string;
  base64File: string;
  mimeType: string;
}) => {
  return createCompletion({
    model: 'meta-llama/llama-3.2-70b-vision-instruct',
    temperature: 0.1,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an expert resume parser. Return strict JSON that matches the provided schema. Do not include markdown or commentary.',
      },
      {
        role: 'user',
        content: [
          { type: 'input_text', text: params.prompt },
          { type: 'input_image', image_base64: params.base64File, mime_type: params.mimeType },
        ],
      },
    ],
  });
};

export const callTextParser = async (prompt: string) => {
  return createCompletion({
    model: 'meta-llama/llama-3.1-8b-instruct',
    temperature: 0.15,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You convert raw resume text into normalized JSON. Never add markdown, only JSON in the response.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
};

export const callJobMatcherModel = async (prompt: string) => {
  return createCompletion({
    model: 'meta-llama/llama-3.1-8b-instruct',
    temperature: 0.35,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are an ATS optimization assistant. Blend keywords naturally, respect truthful experience, and respond with JSON only.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
};

export const callLayoutModel = async (prompt: string) => {
  return createCompletion({
    model: 'meta-llama/llama-3.1-70b-instruct',
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a professional resume formatter. Produce JSON with a formattedText property and updated resume payload.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  });
};


