import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createResume,
  deleteResume,
  ensureUserDocument,
  listenToResumes,
  overwriteResume,
} from '../services/firestore';
import { useResumeStore } from '../store/useResumeStore';
import type { ResumeData } from '../types/resume';
import { emptyResumeData } from '../types/resume';

export const useResumeData = () => {
  const { user } = useAuth();
  const {
    resumes,
    setResumes,
    selectedResumeId,
    selectResume,
    currentResume,
    setCurrentResume,
    resetCurrentResume,
  } = useResumeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      resetCurrentResume();
      return;
    }

    ensureUserDocument(user.uid, user.email ?? '');

    const unsubscribe = listenToResumes(user.uid, (records) => {
      setResumes(records);
      if (!selectedResumeId && records.length) {
        selectResume(records[0].id);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, resetCurrentResume, selectResume, selectedResumeId, setResumes]);

  const handleSave = useCallback(
    async (data: ResumeData) => {
      if (!user || !selectedResumeId) return;
      await overwriteResume(user.uid, selectedResumeId, data);
      setCurrentResume(data);
    },
    [user, selectedResumeId, setCurrentResume]
  );

  const handleCreateResume = useCallback(
    async (title: string) => {
      if (!user) return;
      const newResume = await createResume(user.uid, title);
      selectResume(newResume.id);
      setCurrentResume(newResume as ResumeData);
    },
    [user, selectResume, setCurrentResume]
  );

  const handleDeleteResume = useCallback(
    async (resumeId: string) => {
      if (!user) return;
      await deleteResume(user.uid, resumeId);
      if (selectedResumeId === resumeId) {
        resetCurrentResume();
      }
    },
    [user, selectedResumeId, resetCurrentResume]
  );

  const hydrateWithParsedData = useCallback(
    (parsedResume: ResumeData) => {
      const safeResume: ResumeData = {
        ...emptyResumeData(),
        ...parsedResume,
        resumeSettings: {
          ...emptyResumeData().resumeSettings,
          ...parsedResume.resumeSettings,
        },
      };
      setCurrentResume(safeResume);
    },
    [setCurrentResume]
  );

  return {
    resumes,
    currentResume,
    selectedResumeId,
    loading,
    saveResume: handleSave,
    createResume: handleCreateResume,
    deleteResume: handleDeleteResume,
    selectResume,
    hydrateWithParsedData,
  };
};

