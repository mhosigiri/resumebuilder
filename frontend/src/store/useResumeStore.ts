import { create } from 'zustand';
import type { ResumeData } from '../types/resume';
import { emptyResumeData } from '../types/resume';

interface ResumeRecord {
  id: string;
  data: ResumeData;
}

interface ResumeStore {
  resumes: ResumeRecord[];
  selectedResumeId: string | null;
  currentResume: ResumeData;
  setResumes: (resumes: ResumeRecord[]) => void;
  selectResume: (resumeId: string) => void;
  setCurrentResume: (resume: ResumeData) => void;
  resetCurrentResume: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resumes: [],
  selectedResumeId: null,
  currentResume: emptyResumeData(),
  setResumes: (resumes) =>
    set((state) => {
      const selectedRecord = state.selectedResumeId
        ? resumes.find((r) => r.id === state.selectedResumeId)
        : undefined;
      return {
        resumes,
        currentResume: selectedRecord?.data ?? state.currentResume,
      };
    }),
  selectResume: (resumeId) =>
    set((state) => {
      const selected = state.resumes.find((resume) => resume.id === resumeId);
      return {
        selectedResumeId: resumeId,
        currentResume: selected?.data ?? state.currentResume,
      };
    }),
  setCurrentResume: (resume) =>
    set({
      currentResume: resume,
    }),
  resetCurrentResume: () =>
    set({
      currentResume: emptyResumeData(),
      selectedResumeId: null,
    }),
}));

