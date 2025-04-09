/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/app/utils/firebase/config';

// Components
import TherapistHeaderSection from '@/app/(dashboard)/therapist/(index)/componenets/HeaderSection';
import QuickStats from '@/app/(dashboard)/therapist/(index)/componenets/QuickStats';
import TodaySchedule from '@/app/(dashboard)/therapist/(index)/componenets/TodaySchedule';
import RecentPatientNotes from '@/app/(dashboard)/therapist/(index)/componenets/RecentPatientNotes';
import Notifications from '@/app/(dashboard)/therapist/(index)/componenets/Notifications';
import QuickActions from '@/app/(dashboard)/therapist/(index)/componenets/QuickActions';
import ClinicalResources from '@/app/(dashboard)/therapist/(index)/componenets/ClinicalResources';

// Types
import { UserProfile, Session, Notification, PatientNote, PatientMetric } from '@/app/(dashboard)/shared/types/interfaces';

export default function TherapistDashboard() {
  const [todaySchedule, setTodaySchedule] = useState<Session[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [greeting, setGreeting] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [therapistProfile, setTherapistProfile] = useState<UserProfile | null>(null);
  const [recentNotes, setRecentNotes] = useState<PatientNote[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [patientMetrics, setPatientMetrics] = useState<PatientMetric[]>([]);
  const [upcomingSession, setUpcomingSession] = useState<Session | null>(null);

  // Helper function to compute greeting based on time of day
  const getGreeting = useCallback((): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // Update greeting every minute
  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, [getGreeting]);

  // Fetch therapist profile from Firestore
  useEffect(() => {
    const fetchProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setTherapistProfile(userDocSnap.data() as UserProfile);
        }
      }
    };
    fetchProfile();
  }, []);

  // Fetch today's schedule and total patients from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setLoadingSchedule(false);
          return;
        }
        const db = getFirestore();
        const therapistId = currentUser.uid;

        // Fetch today's schedule
        const sessionsRef = collection(db, 'sessions');
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        const todayQuery = query(
          sessionsRef,
          where('therapistId', '==', therapistId),
          where('sessionDate', '>=', startOfToday),
          where('sessionDate', '<', endOfToday)
        );
        const todaySnapshot = await getDocs(todayQuery);
        const schedule: Session[] = todaySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            sessionDate: data.sessionDate.toDate(),
            therapist: data.therapist,
            therapistId: data.therapistId,
            summary: data.summary,
            shortSummary: data.shortSummary || '',
            keyPoints: data.keyPoints || [],
            insights: data.insights || [],
            mood: data.mood || '',
            progress: data.progress || '',
            goals: data.goals || [],
            warnings: data.warnings || [],
            transcript: data.transcript || '',
            journalingPrompt: data.journalingPrompt || '',
            journalingResponse: data.journalingResponse || '',
            patientId: data.patientId,
            status: data.status || '',
          };
        });

        // Fetch patient names for today's schedule
        const scheduleWithPatientNames = await Promise.all(
          schedule.map(async (session) => {
            try {
              const patientRef = doc(db, 'users', session.patientId);
              const patientSnap = await getDoc(patientRef);
              if (patientSnap.exists()) {
                const patientData = patientSnap.data();
                return {
                  ...session,
                  patientName: `${patientData.first_name} ${patientData.last_name}`,
                };
              }
            } catch (error) {
              console.error('Error fetching patient data:', error);
            }
            return { ...session, patientName: session.patientId };
          })
        );
        scheduleWithPatientNames.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
        setTodaySchedule(scheduleWithPatientNames);

        // Fetch upcoming session (first session after now)
        const upcomingSessions = scheduleWithPatientNames.filter(
          session => session.sessionDate > now && session.status === 'scheduled'
        );
        if (upcomingSessions.length > 0) {
          setUpcomingSession(upcomingSessions[0]);
        }

        // Fetch total patients (unique patient IDs across all sessions for this therapist)
        const allSessionsQuery = query(sessionsRef, where('therapistId', '==', therapistId));
        const allSessionsSnapshot = await getDocs(allSessionsQuery);
        const patientIds = new Set<string>();
        allSessionsSnapshot.forEach((doc) => {
          patientIds.add(doc.data().patientId);
        });
        setTotalPatients(patientIds.size);

        // For demo purposes, create some sample notes with patient info from sessions
        const sampleNotes: PatientNote[] = [];
        const usedPatients = new Set<string>();

        for (const session of scheduleWithPatientNames.slice(0, 3)) {
          if (!usedPatients.has(session.patientId) && session.patientName) {
            sampleNotes.push({
              id: `note-${sampleNotes.length + 1}`,
              patientId: session.patientId,
              patientName: session.patientName,
              date: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within past week
              title: 'Session Summary',
              content: 'Patient reported improved sleep patterns and reduced anxiety following the implementation of mindfulness exercises.',
              sessionId: session.id,
              type: 'session',
            });
            usedPatients.add(session.patientId);
          }
        }

        // Add some observation notes if we have patients
        if (scheduleWithPatientNames.length > 0) {
          const randomSession = scheduleWithPatientNames[Math.floor(Math.random() * scheduleWithPatientNames.length)];
          if (randomSession.patientName) {
            sampleNotes.push({
              id: `note-${sampleNotes.length + 1}`,
              patientId: randomSession.patientId,
              patientName: randomSession.patientName,
              date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
              title: 'Progress Observation',
              content: 'Patient shows significant improvement in coping mechanisms for stress management. Recommended continued practice of relaxation techniques.',
              type: 'observation',
            });
          }
        }

        // Sort notes by date (newest first)
        sampleNotes.sort((a, b) => b.date.getTime() - a.date.getTime());
        setRecentNotes(sampleNotes);

        // Create sample notifications
        const sampleNotifications: Notification[] = [
          {
            id: 'notif-1',
            type: 'appointment',
            title: 'New Appointment',
            message: 'A new session has been scheduled for tomorrow at 10:00 AM.',
            date: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
            read: false,
          },
          {
            id: 'notif-2',
            type: 'message',
            title: 'New Message',
            message: 'You have a new message from your patient.',
            date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            read: true,
            patientId: scheduleWithPatientNames.length > 0 ? scheduleWithPatientNames[0].patientId : undefined,
            patientName: scheduleWithPatientNames.length > 0 ? scheduleWithPatientNames[0].patientName : undefined,
          },
          {
            id: 'notif-3',
            type: 'reminder',
            title: 'Complete Session Notes',
            message: 'Please complete your notes for yesterday\'s sessions.',
            date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            read: true,
          },
        ];
        setNotifications(sampleNotifications);

        // Create sample patient metrics for visualization
        if (scheduleWithPatientNames.length > 0) {
          const metrics: PatientMetric[] = [];
          const patientSet = new Set();

          scheduleWithPatientNames.forEach(session => {
            if (session.patientName && !patientSet.has(session.patientId)) {
              patientSet.add(session.patientId);
              metrics.push({
                patientId: session.patientId,
                patientName: session.patientName,
                sessionsCompleted: Math.floor(Math.random() * 20) + 1,
                progressScore: Math.floor(Math.random() * 100),
                journalEntries: Math.floor(Math.random() * 30),
                riskLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high'
              });
            }
          });

          setPatientMetrics(metrics);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      } finally {
        setLoadingSchedule(false);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading dashboard...</div>
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header Section */}
      <TherapistHeaderSection
        greeting={greeting}
        therapistLastName={therapistProfile ? therapistProfile.last_name : 'Loading...'}
        sessionsCount={todaySchedule.length}
        upcomingSession={upcomingSession}
      />

      {/* Quick Stats Section */}
      <QuickStats
        totalPatients={totalPatients}
        totalSessions={todaySchedule.length}
        unreadNotifications={notifications.filter(n => !n.read).length}
        recentNotesCount={recentNotes.length}
      />

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Schedule */}
          <TodaySchedule sessions={todaySchedule} />

          {/* Recent Patient Notes */}
          <RecentPatientNotes notes={recentNotes} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <Notifications notifications={notifications} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Clinical Resources */}
          <ClinicalResources />
        </div>
      </div>
    </div>
  );
}