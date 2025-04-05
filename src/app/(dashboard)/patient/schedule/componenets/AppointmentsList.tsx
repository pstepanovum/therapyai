import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, LucideIcon } from 'lucide-react';
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

  return (
    <div className="flex items-center gap-4 p-4 bg-[#146C94]/5 rounded-lg hover:bg-[#146C94]/10 transition-colors border border-[#146C94]/10">
      <div className="h-10 w-10 rounded-full bg-[#146C94]/20 flex items-center justify-center flex-shrink-0">
        <session.icon className="h-5 w-5 text-[#146C94]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium text-[#146C94] truncate">{session.therapist}</h3>
        </div>
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-[#146C94]" />
            <span>{session.sessionDate.toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-[#146C94]" />
            <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
      <Badge variant="secondary" className={getStatusBadge(session.status)}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Badge>
      <Button
        variant="outline"
        size="sm"
        className="border-[#146C94]/20 text-[#146C94] hover:bg-[#146C94]/10 flex-shrink-0 rounded-full"
        onClick={() => onViewDetails(session.id)}
      >
        Details
      </Button>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="text-center py-10 text-gray-500">
    <Calendar className="mx-auto h-12 w-12 opacity-50 mb-4" />
    <p>No appointments scheduled yet.</p>
  </div>
);

interface AppointmentsListProps {
  sessions?: ImportedSession[] | Session[];
  filter?: string;
  onFilterChange: (value: string) => void;
  onViewDetails?: (id: string | number) => void;
  viewMode?: "calendar" | "list";
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ 
  sessions = [], 
  filter = 'all', 
  onFilterChange,
  onViewDetails = (id) => console.log(`View details for session ${id}`),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  viewMode
}) => {
  return (
    <Card className="lg:col-span-3 bg-white shadow-sm rounded-xl border-[#146C94]/10">
      <CardHeader className="border-b border-[#146C94]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle className="text-lg font-semibold text-[#146C94]">Upcoming Appointments</CardTitle>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-full sm:w-40 border-[#146C94]/20">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-2">
          {sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
};

export default AppointmentsList;