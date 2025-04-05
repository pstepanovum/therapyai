/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, LucideIcon, ChevronRight } from 'lucide-react';
import { Session as ImportedSession } from './types';

// Define types for session and status
type SessionStatus = 'scheduled' | 'completed' | string;

// Local session interface that matches the imported one
interface Session {
  id: string | number;
  therapist: string;
  sessionDate: Date;
  status: SessionStatus;
  icon: LucideIcon;
  // Add any other properties needed to make it compatible with imported Session
  therapistId?: string;
  summary?: string;
  detailedNotes?: string;
  keyPoints?: string[];
  insights?: string[];
  mood?: string;
  progress?: string;
  goals?: string[];
  warnings?: string[];
  transcript?: string;
  journalingPrompt?: string;
  journalingResponse?: string;
  patientId?: string;
}

interface AppointmentCardProps {
  session: Session;
  onViewDetails: (id: string | number) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ session, onViewDetails }) => {
  const getStatusBadge = (status: SessionStatus): string => {
    switch (status) {
      case "scheduled": return "bg-[#146C94]/10 text-[#146C94]"
      case "completed": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  };

  // Check if a session is happening now
  const isInProgress = () => {
    const now = new Date();
    const sessionStart = new Date(session.sessionDate);
    const sessionEnd = new Date(session.sessionDate);
    sessionEnd.setHours(sessionEnd.getHours() + 1); // Assuming 1 hour sessions
    
    return now >= sessionStart && now <= sessionEnd;
  };

  // Get appropriate badge text
  const getBadgeText = () => {
    if (session.status === "completed") return "Completed";
    if (isInProgress()) return "In Progress";
    return session.status.charAt(0).toUpperCase() + session.status.slice(1);
  };

  // Get appropriate badge class
  const getBadgeClass = () => {
    if (session.status === "completed") return "bg-green-100 text-green-800";
    if (isInProgress()) return "bg-blue-100 text-blue-800";
    return getStatusBadge(session.status);
  };

  return (
    <div 
      className="flex items-center gap-3 p-3 md:p-4 bg-[#146C94]/5 rounded-lg hover:bg-[#146C94]/10 transition-colors border border-[#146C94]/10 cursor-pointer"
      onClick={() => onViewDetails(session.id)}
    >
      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#146C94]/20 flex items-center justify-center flex-shrink-0">
        <session.icon className="h-4 w-4 md:h-5 md:w-5 text-[#146C94]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-[#146C94] truncate text-sm md:text-base">{session.therapist}</h3>
        </div>
        <div className="mt-1 md:mt-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
            <span>{session.sessionDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: undefined
            })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
            <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
        <Badge variant="secondary" className={`text-xs whitespace-nowrap ${getBadgeClass()}`}>
          {getBadgeText()}
        </Badge>
        <ChevronRight className="h-4 w-4 text-[#146C94] hidden md:block" />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  dateText?: string;
  onNewAppointment?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ dateText, onNewAppointment }) => (
  <div className="text-center py-6 md:py-10 text-gray-500 flex flex-col items-center">
    <Calendar className="mx-auto h-10 w-10 md:h-12 md:w-12 opacity-50 mb-3 md:mb-4" />
    <p className="text-sm md:text-base">
      {dateText ? `No appointments ${dateText}` : "No appointments scheduled yet."}
    </p>
    <p className="text-xs md:text-sm text-gray-400 mt-1">Book a new session to get started</p>
  </div>
);

interface AppointmentsListProps {
  sessions?: ImportedSession[] | Session[];
  filter?: string;
  onFilterChange?: (value: string) => void;
  onViewDetails?: (id: string | number) => void;
  viewMode?: "calendar" | "list";
  selectedDate?: Date | undefined;
  standalone?: boolean; // If true, renders with its own Card wrapper
  emptyStateText?: string; // Custom text for empty state
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  sessions = [], 
  filter = 'all', 
  onFilterChange = () => {},
  onViewDetails = (id) => console.log(`View details for session ${id}`),
  viewMode = "list",
  selectedDate,
  standalone = false,
  emptyStateText
}) => {
  // Function to render just the list content
  const renderListContent = () => (
    <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 md:pr-2 -mr-1 md:-mr-2 pb-1">
      {sessions.length === 0 ? (
        <EmptyState dateText={emptyStateText} />
      ) : (
        <div className="space-y-2 md:space-y-4">
          {sessions.map((session) => (
            <AppointmentCard 
              key={session.id} 
              session={session as Session} 
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );

  // If not standalone, just return the list content
  if (!standalone) {
    return renderListContent();
  }
  
  // Otherwise, return with the Card wrapper
  return (
    <Card className="lg:col-span-3 bg-white shadow-sm rounded-xl border-[#146C94]/10">
      <CardHeader className="border-b border-[#146C94]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 md:gap-4 py-3 px-4 md:p-6">
        <CardTitle className="text-base md:text-lg font-semibold text-[#146C94]">
          {selectedDate 
            ? `Sessions on ${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` 
            : "Upcoming Appointments"}
        </CardTitle>
        <div className="w-full sm:w-auto">
          <Select value={filter} onValueChange={onFilterChange}>
            <SelectTrigger className="w-full sm:w-40 border-[#146C94]/20 h-9 text-xs md:text-sm">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-4 md:pt-6 px-3 md:px-6">
        {renderListContent()}
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;