import { useCallback, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { generateRoadmap as generateGeminiRoadmap } from '../services/gemini';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';

function makeProgressMilestones(phase) {
  return (phase?.milestones || []).map((text) => ({
    text,
    checked: false,
    checkedAt: null,
  }));
}

export function progressDocId(uid, roadmapId, phaseIndex) {
  return `${uid}_${roadmapId}_${phaseIndex}`;
}

export function useRoadmap() {
  const { user } = useAuth();
  const [roadmapData, setRoadmapData] = useState(null);
  const [userInput, setUserInput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoadmap = useCallback(async (input) => {
    setLoading(true);
    setError('');

    try {
      const data = await generateGeminiRoadmap(
        input.stream,
        input.skills,
        input.goal,
        input.duration,
        input.level
      );
      setUserInput(input);
      setRoadmapData(data);
      return data;
    } catch (generateError) {
      const message = generateError.message || 'Could not generate roadmap.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveRoadmap = useCallback(
    async (input = userInput, phases = roadmapData?.phases || []) => {
      if (!user) throw new Error('You must be signed in to save a roadmap.');
      if (!input || !phases.length) throw new Error('No roadmap data is available to save.');

      setError('');

      try {
        const docRef = await addDoc(collection(db, 'roadmaps'), {
          uid: user.uid,
          createdAt: serverTimestamp(),
          userInput: {
            stream: input.stream,
            skills: input.skills,
            goal: input.goal,
            duration: input.duration,
            level: input.level,
          },
          phases,
        });

        await Promise.all(
          phases.map((phase, phaseIndex) =>
            setDoc(doc(db, 'progress', progressDocId(user.uid, docRef.id, phaseIndex)), {
              uid: user.uid,
              roadmapId: docRef.id,
              phaseIndex,
              milestones: makeProgressMilestones(phase),
            })
          )
        );

        return docRef.id;
      } catch (saveError) {
        const message = saveError.message || 'Could not save roadmap.';
        setError(message);
        throw new Error(message);
      }
    },
    [roadmapData?.phases, user, userInput]
  );

  const loadRoadmap = useCallback(
    async (roadmapId) => {
      if (!user) throw new Error('You must be signed in to load a roadmap.');
      setLoading(true);
      setError('');

      try {
        const roadmapRef = doc(db, 'roadmaps', roadmapId);
        const roadmapSnapshot = await getDoc(roadmapRef);

        if (!roadmapSnapshot.exists()) {
          throw new Error('Roadmap was not found.');
        }

        const data = roadmapSnapshot.data();
        if (data.uid !== user.uid) {
          throw new Error('You do not have access to this roadmap.');
        }

        const progressQuery = query(
          collection(db, 'progress'),
          where('uid', '==', user.uid),
          where('roadmapId', '==', roadmapId)
        );
        const progressSnapshot = await getDocs(progressQuery);
        const progressDocs = progressSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        const loadedRoadmap = { id: roadmapSnapshot.id, ...data };
        setRoadmapData({ phases: data.phases || [] });
        setUserInput(data.userInput || null);

        return { roadmap: loadedRoadmap, progressDocs };
      } catch (loadError) {
        const message = loadError.message || 'Could not load roadmap.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    roadmapData,
    userInput,
    loading,
    error,
    generateRoadmap,
    saveRoadmap,
    loadRoadmap,
    setRoadmapData,
    setUserInput,
  };
}
