/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  ClipboardList, 
  Plus, 
  ArrowRight, 
  UserCircle, 
  BellRing, 
  MessageSquare, 
  FileText,
  CheckCircle2,
  Brain
} from 'lucide-react';
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

// Interface for patient metrics
interface PatientMetric {
  patientId: string;
  patientName: string;
  sessionsCompleted: number;
  progressScore: number;
  journalEntries: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function TherapistDashboard() {
  const [todaySchedule, setTodaySchedule] = useState<Session[]>([]);
  const [totalPatients, setTotalPatients] = useState<number>(0);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [greeting, setGreeting] = useState<string>('');
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

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">High Risk</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen">
      <div className='max-w-6xl mx-auto'>
        {/* Header Section */}
        <div className='mb-8 rounded-xl p-6'>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className='text-3xl font-bold text-[#146C94]'>
                {greeting}, Dr. {therapistProfile ? therapistProfile.last_name : 'Loading...'}!
              </h1>
              <p className='text-gray-600 mt-2'>
                You have {todaySchedule.length} session{todaySchedule.length !== 1 && 's'} scheduled for today
              </p>
            </div>
            {upcomingSession && (
              <div className="bg-[#146C94]/5 p-4 rounded-lg">
                <div className="text-sm font-medium text-[#146C94] mb-2">Next Appointment</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#146C94]" />
                  <span>
                    {upcomingSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span>with</span>
                  <span className="font-medium">{upcomingSession.patientName}</span>
                  <Link 
                    href={`/rooms/${upcomingSession.id}`}
                    className="ml-2 bg-[#146C94] text-white text-xs px-3 py-1 rounded-md hover:bg-[#146C94]/90"
                  >
                    Join
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center'>
                <Users className='h-8 w-8 text-[#146C94] mb-2' />
                <p className='text-2xl font-bold text-[#146C94]'>{totalPatients}</p>
                <p className='text-sm text-[#146C94]/70'>Total Patients</p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center'>
                <Calendar className='h-8 w-8 text-[#146C94] mb-2' />
                <p className='text-2xl font-bold text-[#146C94]'>{todaySchedule.length}</p>
                <p className='text-sm text-[#146C94]/70'>Today&apos;s Sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center'>
                <BellRing className='h-8 w-8 text-[#146C94] mb-2' />
                <p className='text-2xl font-bold text-[#146C94]'>{notifications.filter(n => !n.read).length}</p>
                <p className='text-sm text-[#146C94]/70'>Unread Notifications</p>
              </div>
            </CardContent>
          </Card>

          <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardContent className='pt-6'>
              <div className='flex flex-col items-center'>
                <ClipboardList className='h-8 w-8 text-[#146C94] mb-2' />
                <p className='text-2xl font-bold text-[#146C94]'>{recentNotes.length}</p>
                <p className='text-sm text-[#146C94]/70'>Recent Notes</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Today's Schedule */}
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <Calendar className='h-5 w-5 text-[#146C94]' />
                  Today&apos;s Schedule
                </CardTitle>
                <CardDescription>
                  Your appointments for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaySchedule.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <p className='text-gray-600'>No sessions scheduled for today.</p>
                    <Button 
                      variant="outline" 
                      className="border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule New Session
                    </Button>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {todaySchedule.map((session) => (
                      <div key={session.id} className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all'>
                        <div className='flex items-center gap-3 mb-3 sm:mb-0'>
                          <div className="relative">
                            <UserCircle className='h-10 w-10 text-[#146C94]' />
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              session.status === 'scheduled' ? 'bg-green-500' : 
                              session.status === 'completed' ? 'bg-blue-500' : 
                              session.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                          </div>
                          <div>
                            <p className='font-medium'>{session.patientName}</p>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <Clock className='h-3 w-3' />
                              <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <Badge className={`
                                ${session.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                                  session.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                  session.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                              `}>
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col xs:flex-row gap-2">
                          <Link
                            href={`/patients/${session.patientId}`}
                            className='flex flex-row items-center bg-white border border-[#146C94] text-[#146C94] px-3 py-2 rounded-md text-sm font-medium hover:bg-[#146C94]/5 transition-all duration-200'
                          >
                            Patient Profile
                          </Link>
                          <Link
                            href={`/rooms/${session.id}`}
                            className='flex flex-row items-center bg-[#146C94] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200 shadow-sm'
                          >
                            Join Room
                            <ArrowRight className='h-4 w-4 ml-2' />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  variant="outline" 
                  className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                >
                  View Full Calendar
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Patient Notes */}
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
              <div className="h-1"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    <FileText className='h-5 w-5 text-[#146C94]' />
                    Recent Patient Notes
                  </CardTitle>
                  <CardDescription>
                    Your most recent clinical documentation
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  <Plus className="h-4 w-4 mr-1" />
                  New Note
                </Button>
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
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  View All Patient Metrics
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
              <div className="h-1"></div>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    <BellRing className='h-5 w-5 text-[#146C94]' />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Your recent alerts and updates
                  </CardDescription>
                </div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                  {notifications.filter(n => !n.read).length} new
                </Badge>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className='text-gray-600'>No notifications.</p>
                ) : (
                  <div className='space-y-3 max-h-64 overflow-y-auto'>
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
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>

            {/* Quick Actions */}
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <CheckCircle2 className='h-5 w-5 text-[#146C94]' />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common tasks and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
                  <Plus className="mr-2 h-4 w-4" /> 
                  Schedule New Session
                </Button>
                
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  <FileText className="mr-2 h-4 w-4" /> 
                  Create New Note
                </Button>
                
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  <MessageSquare className="mr-2 h-4 w-4" /> 
                  Message Patient
                </Button>
                
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  <Users className="mr-2 h-4 w-4" /> 
                  View Patient List
                </Button>
              </CardContent>
            </Card>

            {/* Clinical Resources */}
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                  <Brain className='h-5 w-5 text-[#146C94]' />
                  Clinical Resources
                </CardTitle>
                <CardDescription>
                  Therapeutic tools and resources
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-md flex-shrink-0">
                      <FileText className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Assessment Templates</h4>
                      <p className="text-xs text-gray-600">Standardized assessment tools</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-md flex-shrink-0">
                      <Brain className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">CBT Worksheets</h4>
                      <p className="text-xs text-gray-600">Resources for cognitive therapy</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-md flex-shrink-0">
                      <Calendar className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Treatment Planners</h4>
                      <p className="text-xs text-gray-600">Care plan templates and goals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                  Browse Resource Library
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}