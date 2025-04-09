'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Filter, Search, Video, FileText, ArrowRight } from 'lucide-react';
import { getFirestore, collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { auth } from '@/app/utils/firebase/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Session } from "@/app/(dashboard)/shared/types/interfaces";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setLoading(false);
          return;
        }

        const db = getFirestore();
        const sessionsRef = collection(db, 'sessions');
        const therapistId = user.uid;
        
        // Create base query for therapist's sessions
        const sessionsQuery = query(
          sessionsRef,
          where('therapistId', '==', therapistId)
        );
        
        const querySnapshot = await getDocs(sessionsQuery);
        
        // Process and map the data
        const fetchedSessions: Session[] = await Promise.all(
          querySnapshot.docs.map(async (sessionDoc) => {
            const data = sessionDoc.data();
            const sessionDate = data.sessionDate.toDate();
            
            // Fetch patient name
            let patientName = 'Unknown Patient';
            try {
              const patientRef = doc(db, 'users', data.patientId);
              const patientSnap = await getDoc(patientRef);
              if (patientSnap.exists()) {
                const patientData = patientSnap.data() as { first_name?: string; last_name?: string };
                patientName = `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim();
              }
            } catch (error) {
              console.error('Error fetching patient data:', error);
            }
            
            return {
              id: sessionDoc.id,
              sessionDate,
              patientId: data.patientId,
              patientName,
              status: data.status || 'scheduled',
              summary: data.summary || 'No summary available',
              // Add the following required fields with default values:
              therapist: data.therapist || '',
              therapistId: data.therapistId || '',
              shortSummary: data.shortSummary || '',
              keyPoints: data.keyPoints || [],
              insights: data.insights || [],
              mood: data.mood || '',
              progress: data.progress || '',
              goals: data.goals || [],
              warnings: data.warnings || [],
              transcript: data.transcript || '',
              journalingPrompt: data.journalingPrompt || '',
              journalingResponse: data.journalingResponse || ''
            };
          })
        );
        
        // Sort sessions - newest first
        fetchedSessions.sort((a, b) => b.sessionDate.getTime() - a.sessionDate.getTime());
        setSessions(fetchedSessions);
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800',
    };
    
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.default;
  };

  // Filter and search functionality
  const filteredSessions = sessions.filter((session) => {
    // Status filter
    const matchesStatus = filter === 'all' || session.status === filter;
    
    // Search query
    const matchesSearch = 
      (session.patientName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (session.summary?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    
    // Time range filter
    let matchesTimeRange = true;
    const now = new Date();
    if (timeRange === 'past') {
      matchesTimeRange = session.sessionDate < now;
    } else if (timeRange === 'upcoming') {
      matchesTimeRange = session.sessionDate > now;
    }
    
    return matchesStatus && matchesSearch && matchesTimeRange;
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#146C94] animate-pulse">Loading sessions...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#146C94]">Sessions</h1>
        <p className="text-gray-600 mt-1">
          Review past sessions and upcoming appointments
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search by patient name or keywords..." 
            className="pl-10 pr-4 py-2 w-full md:w-80"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full md:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full md:w-40">
              <Clock className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="past">Past</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg text-gray-500">No sessions found matching your filters</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setFilter('all');
                  setTimeRange('all');
                  setSearchQuery('');
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#146C94]/10 flex items-center justify-center flex-shrink-0">
                      <Video className="h-6 w-6 text-[#146C94]" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{session.patientName}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
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
                  <Link href={`/therapist/sessions/${session.id}`}>
                    <Button className="bg-[#146C94] hover:bg-[#146C94]/90">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{session.summary}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}