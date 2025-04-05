'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, ClipboardList, Plus, ArrowRight, UserCircle, BellRing, MessageSquare, FileText } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { auth } from '@/app/utils/firebase/config';

// Define an interface for a user profile
interface UserProfile {
  email: string;
  first_name: string;
  last_name: string;
  role: 'therapist' | 'patient';
}

// Define a proper interface for a session document
export interface Session {
  id: string;
  sessionDate: Date;
  therapist: string;
  therapistId: string;
  summary: string;
  shortSummary?: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
  transcript: string;
  journalingPrompt: string;
  journalingResponse: string;
  patientId: string;
  status: string;
  patientName?: string;
}

// Interface for notification
interface Notification {
  id: string;
  type: 'message' | 'appointment' | 'reminder' | 'system';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  patientId?: string;
  patientName?: string;
}

// Interface for patient note
interface PatientNote {
  id: string;
  patientId: string;
  patientName: string;
  date: Date;
  title: string;
  content: string;
  sessionId?: string;
  type: 'session' | 'observation' | 'journal';
}

export default function TherapistDashboard() {
  const [todaySchedule, setTodaySchedule] = useState<Session[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [greeting, setGreeting] = useState<string>('');
  const [therapistProfile, setTherapistProfile] = useState<UserProfile | null>(null);
  const [recentNotes, setRecentNotes] = useState<PatientNote[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoadingSchedule(false);
      }
    };

    fetchData();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'appointment':
        return <Calendar className="h-4 w-4 text-green-500" />;
      case 'reminder':
        return <BellRing className="h-4 w-4 text-amber-500" />;
      default:
        return <BellRing className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loadingSchedule) {
    return <div className='p-6 max-w-6xl mx-auto'>Loading dashboard...</div>;
  }

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      {/* Header Section */}
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-[#146C94]'>
          {greeting}, Dr. {therapistProfile ? therapistProfile.last_name : 'Loading...'}!
        </h1>
        <p className='text-gray-600 mt-2'>
          You have {todaySchedule.length} session{todaySchedule.length !== 1 && 's'} scheduled for today
        </p>
      </div>

      {/* Quick Stats Section */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
        <Card className='bg-[#146C94]/5'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center'>
              <Users className='h-8 w-8 text-[#146C94] mb-2' />
              <p className='text-2xl font-bold text-[#146C94]'>{totalPatients}</p>
              <p className='text-sm text-[#146C94]/70'>Total Patients</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-[#146C94]/5'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center'>
              <Calendar className='h-8 w-8 text-[#146C94] mb-2' />
              <p className='text-2xl font-bold text-[#146C94]'>{todaySchedule.length}</p>
              <p className='text-sm text-[#146C94]/70'>Today&apos;s Sessions</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-[#146C94]/5'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center'>
              <BellRing className='h-8 w-8 text-[#146C94] mb-2' />
              <p className='text-2xl font-bold text-[#146C94]'>{notifications.filter(n => !n.read).length}</p>
              <p className='text-sm text-[#146C94]/70'>Unread Notifications</p>
            </div>
          </CardContent>
        </Card>

        <Card className='bg-[#146C94]/5'>
          <CardContent className='pt-6'>
            <div className='flex flex-col items-center'>
              <ClipboardList className='h-8 w-8 text-[#146C94] mb-2' />
              <p className='text-2xl font-bold text-[#146C94]'>{recentNotes.length}</p>
              <p className='text-sm text-[#146C94]/70'>Recent Notes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-[#146C94]' />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todaySchedule.length === 0 ? (
              <p className='text-gray-600'>No sessions scheduled for today.</p>
            ) : (
              <div className='space-y-4'>
                {todaySchedule.map((session) => (
                  <div key={session.id} className='flex items-center justify-between p-2 rounded-lg hover:bg-gray-50'>
                    <div className='flex items-center gap-3'>
                      <UserCircle className='h-8 w-8 text-[#146C94]' />
                      <div>
                        <p className='font-medium'>{session.patientName}</p>
                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                          <Clock className='h-3 w-3' />
                          <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span>{session.status}</span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/rooms/${session.id}`}
                      className='flex flex-row items-center bg-[#AFD3E2] text-[#146C94] px-5 py-2 rounded-md text-sm font-medium hover:bg-[#146C94] hover:text-[#F6F1F1] transition-all duration-200 shadow-sm hover:shadow-md'
                    >
                      Join Room
                      <ArrowRight className='h-4 w-4 ml-2' />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className='text-lg font-semibold flex items-center gap-2'>
              <BellRing className='h-5 w-5 text-[#146C94]' />
              Notifications
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-[#146C94]">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className='text-gray-600'>No notifications.</p>
            ) : (
              <div className='space-y-3'>
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-[#146C94]/5'} border ${notification.read ? 'border-gray-100' : 'border-[#146C94]/20'}`}>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500">
                            {notification.date.toLocaleDateString()} {notification.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                        {notification.patientName && (
                          <p className="text-xs text-[#146C94] mt-1">Related to: {notification.patientName}</p>
                        )}
                        {!notification.read && (
                          <Badge className="mt-2 bg-[#146C94]/10 text-[#146C94] hover:bg-[#146C94]/20 px-2 py-0.5 text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Patient Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className='text-lg font-semibold flex items-center gap-2'>
            <FileText className='h-5 w-5 text-[#146C94]' />
            Recent Patient Notes
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="text-[#146C94] border-[#146C94]/20">
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
            <Button variant="ghost" size="sm" className="text-[#146C94]">
              View All Notes
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentNotes.length === 0 ? (
            <p className='text-gray-600'>No recent notes.</p>
          ) : (
            <div className='space-y-4'>
              {recentNotes.map((note) => (
                <div key={note.id} className='p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow'>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{note.title}</h3>
                      <p className="text-sm text-[#146C94]">
                        Patient: {note.patientName}
                      </p>
                    </div>
                    <Badge variant="outline" className={`
                      ${note.type === 'session' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                        note.type === 'observation' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                        'bg-green-50 text-green-700 border-green-200'}
                    `}>
                      {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">{note.date.toLocaleDateString()}</p>
                    <Button variant="ghost" size="sm" className="text-[#146C94] h-8 px-2">
                      View Details
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}