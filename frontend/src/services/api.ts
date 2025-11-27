import axios from 'axios';
import type { ResumeData } from '../types/resume';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

export const uploadResumeFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<{ resume: ResumeData }>(
    '/parse-file',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data.resume;
};

export const parseResumeText = async (text: string) => {
  const { data } = await apiClient.post<{ resume: ResumeData }>(
    '/parse-text',
    {
      text,
    }
  );
  return data.resume;
};

export const jobMatchResume = async (payload: {
  jobDescription: string;
  resume: ResumeData;
}) => {
  const { data } = await apiClient.post<{
    tailoredText: string;
    updatedResume: ResumeData;
  }>('/job-match', payload);
  return data;
};

export const generateResumeLayout = async (payload: {
  resume: ResumeData;
  template: ResumeData['resumeSettings']['template'];
}) => {
  const { data } = await apiClient.post<{
    formattedText: string;
    updatedResume: ResumeData;
  }>('/generate-resume', payload);
  return data;
};

