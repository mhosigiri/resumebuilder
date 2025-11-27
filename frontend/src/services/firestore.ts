import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ResumeData } from '../types/resume';
import { emptyResumeData } from '../types/resume';

const usersCollection = collection(db, 'users');

const userDoc = (uid: string) => doc(usersCollection, uid);

const resumesCollection = (uid: string) =>
  collection(userDoc(uid), 'resumes');

const resumeDoc = (uid: string, resumeId: string) =>
  doc(resumesCollection(uid), resumeId);

export const ensureUserDocument = async (uid: string, email: string) => {
  const userSnapshot = await getDoc(userDoc(uid));
  if (!userSnapshot.exists()) {
    await setDoc(userDoc(uid), {
      email,
      createdAt: serverTimestamp(),
    });
  }
};

export const createResume = async (uid: string, title: string) => {
  const payload = {
    ...emptyResumeData(),
    resumeTitle: title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(resumesCollection(uid), payload);
  return { id: docRef.id, ...payload };
};

export const updateResume = async (
  uid: string,
  resumeId: string,
  data: Partial<ResumeData>
) => {
  await updateDoc(resumeDoc(uid, resumeId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const overwriteResume = async (
  uid: string,
  resumeId: string,
  data: ResumeData
) => {
  await setDoc(
    resumeDoc(uid, resumeId),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};

export const deleteResume = async (uid: string, resumeId: string) => {
  await deleteDoc(resumeDoc(uid, resumeId));
};

export const listenToResumes = (
  uid: string,
  callback: (resumes: Array<{ id: string; data: ResumeData }>) => void
) => {
  return onSnapshot(resumesCollection(uid), (snapshot) => {
    const documents = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      data: docSnap.data() as ResumeData,
    }));
    callback(documents);
  });
};

