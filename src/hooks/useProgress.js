import { useEffect, useMemo, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { db } from '../services/firebase';
import { toDate, uniqueValues } from '../utils/parseResponse';

function blankData() {
  return {
    roadmaps: [],
    progressDocs: [],
    totalRoadmaps: 0,
    phasesCompleted: 0,
    milestonesChecked: 0,
    skillsCount: 0,
    lineData: [],
    radarData: [],
    barData: [],
    pieData: [],
    activityData: [],
    totalSessions: 0,
    uniqueSkills: [],
  };
}

function getLastDays(days) {
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(now.getDate() - (days - 1 - index));
    return date;
  });
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function completedMilestones(progressDocs) {
  return progressDocs.flatMap((progress) =>
    (progress.milestones || [])
      .filter((milestone) => milestone.checked)
      .map((milestone) => ({
        ...milestone,
        roadmapId: progress.roadmapId,
        phaseIndex: progress.phaseIndex,
      }))
  );
}

export function useProgress() {
  const { user, userProfile } = useAuth();
  const [roadmaps, setRoadmaps] = useState([]);
  const [progressDocs, setProgressDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setRoadmaps([]);
      setProgressDocs([]);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;

    async function loadProgress() {
      setLoading(true);
      setError('');

      try {
        const roadmapsSnapshot = await getDocs(
          query(collection(db, 'roadmaps'), where('uid', '==', user.uid))
        );
        const progressSnapshot = await getDocs(
          query(collection(db, 'progress'), where('uid', '==', user.uid))
        );

        if (cancelled) return;

        const loadedRoadmaps = roadmapsSnapshot.docs
          .map((item) => ({ id: item.id, ...item.data() }))
          .sort((a, b) => {
            const left = toDate(a.createdAt)?.getTime() || 0;
            const right = toDate(b.createdAt)?.getTime() || 0;
            return right - left;
          });

        setRoadmaps(loadedRoadmaps);
        setProgressDocs(progressSnapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      } catch (progressError) {
        if (!cancelled) setError(progressError.message || 'Could not load progress data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProgress();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const data = useMemo(() => {
    if (!user) return blankData();

    const doneMilestones = completedMilestones(progressDocs);
    const milestonesChecked = doneMilestones.length;
    const phasesCompleted = progressDocs.filter((progress) => {
      const milestones = progress.milestones || [];
      return milestones.length > 0 && milestones.every((milestone) => milestone.checked);
    }).length;

    const profileSkills = userProfile?.skills || [];
    const roadmapSkills = roadmaps.flatMap((roadmap) => roadmap.userInput?.skills || []);
    const uniqueSkills = uniqueValues([...profileSkills, ...roadmapSkills]);

    const countsByDate = doneMilestones.reduce((acc, milestone) => {
      const date = toDate(milestone.checkedAt);
      if (!date) return acc;
      const key = dateKey(date);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    const lineData = getLastDays(30).map((date) => ({
      date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date),
      milestones: countsByDate[dateKey(date)] || 0,
    }));

    const radarData = (uniqueSkills.length ? uniqueSkills : ['Planning', 'Practice', 'Projects'])
      .slice(0, 8)
      .map((skill) => ({
        skill,
        value:
          20 +
          Math.min(
            80,
            15 *
              roadmaps.filter((roadmap) =>
                (roadmap.userInput?.skills || []).includes(skill)
              ).length +
              milestonesChecked
          ),
      }));

    const progressByRoadmap = progressDocs.reduce((acc, progress) => {
      acc[progress.roadmapId] = acc[progress.roadmapId] || [];
      acc[progress.roadmapId].push(progress);
      return acc;
    }, {});

    const barData = roadmaps.map((roadmap, index) => {
      const docs = progressByRoadmap[roadmap.id] || [];
      const complete = docs.filter((progress) => {
        const milestones = progress.milestones || [];
        return milestones.length && milestones.every((milestone) => milestone.checked);
      }).length;
      const total = roadmap.phases?.length || docs.length || 1;

      return {
        name: roadmap.userInput?.goal || `Roadmap ${index + 1}`,
        completion: Math.round((complete / total) * 100),
      };
    });

    const topicCounts = roadmaps.reduce((acc, roadmap) => {
      const docs = progressByRoadmap[roadmap.id] || [];
      (roadmap.phases || []).forEach((phase, phaseIndex) => {
        const checkedCount =
          docs
            .find((progress) => progress.phaseIndex === phaseIndex)
            ?.milestones?.filter((milestone) => milestone.checked).length || 0;
        const topic = phase.title?.split(':')[0] || `Phase ${phaseIndex + 1}`;
        acc[topic] = (acc[topic] || 0) + checkedCount;
      });
      return acc;
    }, {});

    const pieData = Object.entries(topicCounts).length
      ? Object.entries(topicCounts).map(([name, value]) => ({ name, value }))
      : [{ name: 'No sessions yet', value: 1 }];

    const activityData = getLastDays(364).map((date) => ({
      date: dateKey(date),
      count: countsByDate[dateKey(date)] || 0,
    }));

    return {
      roadmaps,
      progressDocs,
      totalRoadmaps: roadmaps.length,
      phasesCompleted,
      milestonesChecked,
      skillsCount: uniqueSkills.length,
      lineData,
      radarData,
      barData,
      pieData,
      activityData,
      totalSessions: milestonesChecked,
      uniqueSkills,
    };
  }, [progressDocs, roadmaps, user, userProfile?.skills]);

  return { ...data, loading, error };
}
