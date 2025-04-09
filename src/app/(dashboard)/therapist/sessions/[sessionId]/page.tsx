'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Heart,
  Target,
  ChevronRight,
  ArrowLeft,
  Lightbulb,
  AlertCircle,
  Edit,
  Save,
  Video,
  X,
  BookOpen,
} from 'lucide-react';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

interface Session {
  id: string;
  sessionDate: Date;
  therapistId: string;
  patientId: string;
  patientName?: string;
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
  status: string;
}

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { sessionId } = params;
  
  const [session, setSession] = useState<Session | null>(null);
  const [, setPatient] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [editMode, setEditMode] = useState(false);
  const [editedSummary, setEditedSummary] = useState('');
  const [editedInsights, setEditedInsights] = useState<string[]>([]);
  const [editedGoals, setEditedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        const db = getFirestore();
        const sessionRef = doc(db, 'sessions', sessionId as string);
        const sessionSnap = await getDoc(sessionRef);
        
        if (!sessionSnap.exists()) {
          setError('Session not found');
          setLoading(false);
          return;
        }
        
        const sessionData = sessionSnap.data();
        
        // Fetch patient data
        const patientRef = doc(db, 'users', sessionData.patientId);
        const patientSnap = await getDoc(patientRef);
        
        if (patientSnap.exists()) {
          const patientData = patientSnap.data();
          setPatient(patientData);
          
          // Create session object with patient name
          const formattedSession: Session = {
            id: sessionId as string,
            sessionDate: sessionData.sessionDate.toDate(),
            therapistId: sessionData.therapistId,
            patientId: sessionData.patientId,
            patientName: `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim(),
            summary: sessionData.summary || 'No summary available',
            shortSummary: sessionData.shortSummary || '',
            keyPoints: sessionData.keyPoints || [],
            insights: sessionData.insights || [],
            mood: sessionData.mood || '',
            progress: sessionData.progress || '',
            goals: sessionData.goals || [],
            warnings: sessionData.warnings || [],
            transcript: sessionData.transcript || '',
            journalingPrompt: sessionData.journalingPrompt || '',
            journalingResponse: sessionData.journalingResponse || '',
            status: sessionData.status || 'completed',
          };
          
          setSession(formattedSession);
          setEditedSummary(formattedSession.summary);
          setEditedInsights(formattedSession.insights);
          setEditedGoals(formattedSession.goals);
        } else {
          // If patient not found, still load session without patient details
          const formattedSession: Session = {
            id: sessionId as string,
            sessionDate: sessionData.sessionDate.toDate(),
            therapistId: sessionData.therapistId,
            patientId: sessionData.patientId,
            summary: sessionData.summary || 'No summary available',
            shortSummary: sessionData.shortSummary || '',
            keyPoints: sessionData.keyPoints || [],
            insights: sessionData.insights || [],
            mood: sessionData.mood || '',
            progress: sessionData.progress || '',
            goals: sessionData.goals || [],
            warnings: sessionData.warnings || [],
            transcript: sessionData.transcript || '',
            journalingPrompt: sessionData.journalingPrompt || '',
            journalingResponse: sessionData.journalingResponse || '',
            status: sessionData.status || 'completed',
          };
          
          setSession(formattedSession);
          setEditedSummary(formattedSession.summary);
          setEditedInsights(formattedSession.insights);
          setEditedGoals(formattedSession.goals);
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };
    
    if (sessionId) {
      fetchSessionDetails();
    }
  }, [sessionId]);

  const handleSaveChanges = async () => {
    if (!session) return;
    
    setIsSaving(true);
    try {
      const db = getFirestore();
      const sessionRef = doc(db, 'sessions', session.id);
      
      const updatedData = {
        summary: editedSummary,
        insights: editedInsights,
        goals: editedGoals,
      };
      
      await updateDoc(sessionRef, updatedData);
      
      // Update local state
      setSession({
        ...session,
        summary: editedSummary,
        insights: editedInsights,
        goals: editedGoals,
      });
      
      setEditMode(false);
      // Show success message or notification here if needed
    } catch (error) {
      console.error('Error saving changes:', error);
      // Show error message
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800',
    };
    
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#146C94] animate-pulse">Loading session details...</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#146C94]">Session Details</h1>
            <p className="text-gray-600 mt-1">Session information</p>
          </div>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sessions
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <X className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg text-gray-700">{error || 'Session not found'}</p>
            <Button 
              className="mt-4 bg-[#146C94]"
              onClick={() => router.push('/therapist/sessions')}
            >
              View All Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Navigation Header with Button on Right */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#146C94]">Session Details</h1>
          <p className="text-gray-600 mt-1">
            Complete summary and notes for your therapy session with {session.patientName || 'Patient'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!editMode && (
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sessions
            </Button>
          )}
          {editMode ? (
            <>
              <Button 
                variant="outline" 
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => {
                  setEditMode(false);
                  setEditedSummary(session.summary);
                  setEditedInsights(session.insights);
                  setEditedGoals(session.goals);
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                className="bg-[#146C94]"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center">Saving...</span>
                ) : (
                  <>
                    <Save className="mr-1 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              className="border-[#146C94]/30 text-[#146C94]"
              onClick={() => setEditMode(true)}
            >
              <Edit className="mr-1 h-4 w-4" />
              Edit Details
            </Button>
          )}
        </div>
      </div>

      {/* Session Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0">
                <Video className="h-6 w-6 text-[#146C94]" />
              </div>
              <div>
                <h3 className="text-lg font-medium">{session.patientName || 'Patient'}</h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{session.sessionDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <Badge className={getStatusBadge(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="insights">Insights & Goals</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="journaling">Journaling</TabsTrigger>
        </TabsList>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#146C94]" />
                Session Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <Textarea
                  value={editedSummary}
                  onChange={(e) => setEditedSummary(e.target.value)}
                  className="min-h-32"
                  placeholder="Enter session summary..."
                />
              ) : (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{session.summary}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#146C94]" />
                  Key Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                {session.keyPoints.length > 0 ? (
                  <ul className="space-y-2">
                    {session.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <ChevronRight className="h-5 w-5 text-[#146C94] flex-shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No key points recorded for this session.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-[#146C94]" />
                  Emotional State
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mood</p>
                    <p className="text-gray-700">{session.mood || 'Not recorded'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Progress</p>
                    <p className="text-gray-700">{session.progress || 'Not recorded'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Insights Tab */}
        <TabsContent value="insights" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-[#146C94]" />
                  Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-3">
                    {editedInsights.map((insight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Textarea
                          value={insight}
                          onChange={(e) => {
                            const updatedInsights = [...editedInsights];
                            updatedInsights[index] = e.target.value;
                            setEditedInsights(updatedInsights);
                          }}
                          className="min-h-20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            const updatedInsights = [...editedInsights];
                            updatedInsights.splice(index, 1);
                            setEditedInsights(updatedInsights);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setEditedInsights([...editedInsights, ''])}
                    >
                      Add Insight
                    </Button>
                  </div>
                ) : (
                  <>
                    {session.insights.length > 0 ? (
                      <ul className="space-y-2">
                        {session.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <ChevronRight className="h-5 w-5 text-[#146C94] flex-shrink-0 mt-0.5" />
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No insights recorded for this session.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-[#146C94]" />
                  Goals & Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editMode ? (
                  <div className="space-y-3">
                    {editedGoals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Textarea
                          value={goal}
                          onChange={(e) => {
                            const updatedGoals = [...editedGoals];
                            updatedGoals[index] = e.target.value;
                            setEditedGoals(updatedGoals);
                          }}
                          className="min-h-20"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => {
                            const updatedGoals = [...editedGoals];
                            updatedGoals.splice(index, 1);
                            setEditedGoals(updatedGoals);
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setEditedGoals([...editedGoals, ''])}
                    >
                      Add Goal
                    </Button>
                  </div>
                ) : (
                  <>
                    {session.goals.length > 0 ? (
                      <ul className="space-y-2">
                        {session.goals.map((goal, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-700">
                            <ChevronRight className="h-5 w-5 text-[#146C94] flex-shrink-0 mt-0.5" />
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500">No goals recorded for this session.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#146C94]" />
                Points to Watch
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.warnings.length > 0 ? (
                <ul className="space-y-2">
                  {session.warnings.map((warning, index) => (
                    <li key={index} className="flex items-start gap-2 text-gray-700">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No warnings or points to watch for this session.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Transcript Tab */}
        <TabsContent value="transcript" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#146C94]" />
                Session Transcript
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.transcript ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{session.transcript}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No transcript available for this session.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Journaling Tab */}
        <TabsContent value="journaling" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#146C94]" />
                Journaling Prompt
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.journalingPrompt ? (
                <div className="prose max-w-none">
                  <blockquote className="p-4 bg-[#146C94]/5 border-l-4 border-[#146C94] rounded">
                    <p className="text-gray-700">{session.journalingPrompt}</p>
                  </blockquote>
                </div>
              ) : (
                <p className="text-gray-500">No journaling prompt provided for this session.</p>
              )}
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-[#146C94]" />
                Patient&apos;s Journal Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.journalingResponse ? (
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-line">{session.journalingResponse}</p>
                </div>
              ) : (
                <p className="text-gray-500">The patient has not responded to the journaling prompt yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}