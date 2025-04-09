/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, Firestore } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Import components
import PatientHeaderSection from '@/app/(dashboard)/patient/(index)/components/PatientHeaderSection';
import QuickActionButtons from '@/app/(dashboard)/patient/(index)/components/QuickActionButtons';
import NextSessionCard from '@/app/(dashboard)/patient/(index)/components/NextSessionCard';
import PreviousSessionCard from '@/app/(dashboard)/patient/(index)/components/PreviousSessionCard';
import GoalsProgressCard from '@/app/(dashboard)/patient/(index)/components/GoalsProgressCard';
import MoodTrackerCard from '@/app/(dashboard)/patient/(index)/components/MoodTrackerCard';
import JournalStreakCard from '@/app/(dashboard)/patient/(index)/components/JournalStreakCard';
import PatientNotifications from '@/app/(dashboard)/patient/(index)/components/PatientNotifications';
import WellnessResourcesCard from '@/app/(dashboard)/patient/(index)/components/WellnessResourcesCard';

// Import types
import {
  Session,
  Notification,
  MoodEntry,
  Quote,
  TherapyGoal,
  WellnessResource
} from "@/app/(dashboard)/shared/types/interfaces";

// Sample quotes for motivation
const quotes = [
  {
    text: "Every day is a new beginning. Take a deep breath and start again.",
    author: "Unknown"
  },
  {
    text: "You are stronger than you know, braver than you believe, and more capable than you can imagine.",
    author: "Unknown"
  },
  {
    text: "Progress is progress, no matter how small.",
    author: "Unknown"
  },
  {
    text: "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.",
    author: "Akshay Dubey"
  },
  {
    text: "Self-care is not self-indulgence, it is self-preservation.",
    author: "Audre Lorde"
  }
];

export default function PatientDashboard() {
  const [greeting, setGreeting] = useState("");
  const [quote, setQuote] = useState<Quote>(quotes[0]);
  const [userName, setUserName] = useState("User");
  const [nextSession, setNextSession] = useState<Session | null>(null);
  const [lastSession, setLastSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [journalStreak, setJournalStreak] = useState(0);
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [goalsProgress, setGoalsProgress] = useState(68); // Sample progress percentage
  const [therapyGoals, setTherapyGoals] = useState<TherapyGoal[]>([]);
  const [wellnessResources, setWellnessResources] = useState<WellnessResource[]>([]);

  // Helper function to compute greeting based on time of day
  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  // Function to fetch therapist name with proper Firestore type
  const getTherapistName = async (therapistId: string, db: Firestore): Promise<string> => {
    const therapistRef = doc(db, "users", therapistId);
    const therapistSnap = await getDoc(therapistRef);
    return therapistSnap.exists() ? `Dr. ${therapistSnap.data().last_name}` : "Unknown Therapist";
  };

  useEffect(() => {
    // Set greeting and random quote
    setGreeting(getGreeting());
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);

    // Update greeting every minute
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    const auth = getAuth();
    const db = getFirestore();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user profile
          const uid = user.uid;
          const userDocRef = doc(db, "users", uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setUserName(data.first_name ?
              data.first_name.charAt(0).toUpperCase() + data.first_name.slice(1) :
              user.email ? user.email.split("@")[0] : "User");
          }

          // Fetch sessions data
          const sessionsRef = collection(db, "sessions");
          const q = query(sessionsRef, where("patientId", "==", uid));
          const querySnapshot = await getDocs(q);
          const fetchedSessions: Session[] = await Promise.all(
            querySnapshot.docs.map(async (sessionDoc) => {
              const data = sessionDoc.data();
              const therapistName = await getTherapistName(data.therapistId, db);
              return {
                id: sessionDoc.id,
                sessionDate: data.sessionDate.toDate(),
                therapistId: data.therapistId,
                therapist: therapistName,
                summary: data.summary || "No summary available",
                shortSummary: data.shortSummary || "",
                keyPoints: data.keyPoints || [],
                insights: data.insights || [],
                mood: data.mood || "",
                progress: data.progress || "",
                goals: data.goals || [],
                warnings: data.warnings || [],
                transcript: data.transcript || "",
                journalingPrompt: data.journalingPrompt || "",
                journalingResponse: data.journalingResponse || "",
                status: data.status || "unknown",
                patientId: data.patientId,
              };
            })
          );

          // Set upcoming and past sessions
          fetchedSessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
          const now = new Date();
          const upcoming = fetchedSessions.find(session => session.sessionDate > now && session.status === "scheduled");
          setNextSession(upcoming || null);
          const pastSessions = fetchedSessions.filter(session => session.sessionDate <= now);
          const recentPast = pastSessions[pastSessions.length - 1];
          setLastSession(recentPast || null);

          // Mock data for notifications
          const mockNotifications = [
            {
              id: "1",
              type: "session" as const,
              title: "Session Reminder",
              description: "Your session with Dr. Miller is scheduled for tomorrow at 3:00 PM",
              date: new Date(Date.now() + 24 * 60 * 60 * 1000),
              read: false
            },
            {
              id: "2",
              type: "journal" as const,
              title: "Journal Prompt",
              description: "What are three things you're grateful for today?",
              date: new Date(),
              read: true
            },
            {
              id: "3",
              type: "message" as const,
              title: "New Message",
              description: "Your therapist has sent you a new message",
              date: new Date(Date.now() - 2 * 60 * 60 * 1000),
              read: false
            }
          ];
          setNotifications(mockNotifications);

          // Mock data for journal streak
          setJournalStreak(4);

          // Mock data for mood entries
          const mockMoods = [
            {
              date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
              value: 2,
              notes: "Feeling stressed about work"
            },
            {
              date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
              value: 2,
              notes: "Still worried about deadline"
            },
            {
              date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
              value: 3,
              notes: "Better after talking to team"
            },
            {
              date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              value: 3,
              notes: "Made progress on project"
            },
            {
              date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              value: 4,
              notes: "Relaxed evening, practiced meditation"
            },
            {
              date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              value: 4,
              notes: "Feeling more confident"
            },
            {
              date: new Date(),
              value: 4,
              notes: "Good sleep, productive morning"
            }
          ];
          setRecentMoods(mockMoods);

          // Mock data for therapy goals
          const mockGoals: TherapyGoal[] = [
            {
              id: "goal-1",
              title: "Practice daily mindfulness meditation",
              progress: 75,
              color: "green"
            },
            {
              id: "goal-2",
              title: "Improve sleep hygiene routine",
              progress: 60,
              color: "blue"
            },
            {
              id: "goal-3",
              title: "Practice assertive communication",
              progress: 45,
              color: "purple"
            }
          ];
          setTherapyGoals(mockGoals);

          // Mock data for wellness resources
          const mockResources: WellnessResource[] = [
            {
              id: "resource-1",
              title: "Mindfulness Guide",
              description: "Quick techniques for stress reduction",
              icon: "brain",
              iconBgColor: "blue"
            },
            {
              id: "resource-2",
              title: "Sleep Improvement",
              description: "Tips for better sleep quality",
              icon: "heart",
              iconBgColor: "green"
            },
            {
              id: "resource-3",
              title: "Building Relationships",
              description: "Healthy communication skills",
              icon: "user",
              iconBgColor: "purple"
            }
          ];
          setWellnessResources(mockResources);

        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUserName("Guest");
        setLoading(false);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [getGreeting]);

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading dashboard...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section with Welcome and Quote */}
      <PatientHeaderSection
        greeting={greeting}
        userName={userName}
        quote={quote}
      />

      {/* Quick Action Buttons */}
      <QuickActionButtons />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Next Session Card */}
          <NextSessionCard nextSession={nextSession} />

          {/* Last Session Summary Card */}
          <PreviousSessionCard lastSession={lastSession} />

          {/* Goals Progress */}
          <GoalsProgressCard
            overallProgress={goalsProgress}
            goals={therapyGoals}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Mood Tracker Card */}
          <MoodTrackerCard
            moods={recentMoods}
            trendDirection="improving"
          />

          {/* Journal Streak Card */}
          <JournalStreakCard streakDays={journalStreak} />

          {/* Notifications Card */}
          <PatientNotifications notifications={notifications} />

          {/* Resources Card */}
          <WellnessResourcesCard resources={wellnessResources} />
        </div>
      </div>
    </div>
  );
}