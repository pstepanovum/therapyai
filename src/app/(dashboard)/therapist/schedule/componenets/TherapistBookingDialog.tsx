import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, User, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
}

interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  sessionDate: Date;
  status: string;
}

interface TherapistBookingDialogProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedHour: string;
  onHourSelect: (hour: string) => void;
  selectedMinute: string;
  onMinuteSelect: (minute: string) => void;
  selectedPatient: string;
  onPatientSelect: (patientId: string) => void;
  patients: Patient[];
  appointmentRequests: AppointmentRequest[];
  onBookAppointment: () => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onDeclineAppointment: (appointmentId: string) => void;
  sessionType: string;
  onSessionTypeChange: (type: string) => void;
}

const TherapistBookingDialog: React.FC<TherapistBookingDialogProps> = ({ 
  selectedDate, 
  onDateSelect, 
  selectedHour, 
  onHourSelect, 
  selectedMinute, 
  onMinuteSelect, 
  selectedPatient, 
  onPatientSelect, 
  patients = [],
  appointmentRequests = [],
  onBookAppointment,
  onConfirmAppointment,
  onDeclineAppointment,
  sessionType = "Individual Session",
  onSessionTypeChange
}) => {
  const [activeTab, setActiveTab] = useState<string>("schedule"); // "schedule" or "requests"
  const hours = Array.from({ length: 9 }, (_, i) => (9 + i).toString());
  const minutes = ["00", "15", "30", "45"];

  return (
    <DialogContent className="sm:max-w-md p-4 md:p-6 rounded-xl bg-white">
      <DialogHeader className="mb-4 md:mb-6 text-center">
        <DialogTitle className="text-[#146C94] text-xl md:text-2xl font-bold">
          Manage Appointments
        </DialogTitle>
        <p className="text-[#146C94]/70 text-xs md:text-sm mt-1">Schedule or confirm appointments</p>
      </DialogHeader>
      
      <Tabs defaultValue="schedule" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="schedule" className="rounded-l-lg">Schedule New</TabsTrigger>
          <TabsTrigger value="requests" className="rounded-r-lg">
            Pending Requests
            {appointmentRequests.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                {appointmentRequests.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Schedule New Appointment Tab */}
        <TabsContent value="schedule" className="space-y-5 md:space-y-6">
          {/* Date Selection with Popover */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[#146C94] font-medium text-sm">Pick a Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-10 md:h-11 border-[#146C94]/20 bg-[#146C94]/5 rounded-lg justify-start text-left font-normal text-[#146C94] text-sm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white border-[#146C94]/20 rounded-lg shadow-lg">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onDateSelect}
                  initialFocus
                  className="bg-[#146C94]/5 p-3 rounded-lg"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Selection */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[#146C94] font-medium text-sm">Choose a Time</Label>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <Select value={selectedHour} onValueChange={onHourSelect}>
                <SelectTrigger className="border-[#146C94]/20 h-10 md:h-11 bg-[#146C94]/5 rounded-lg text-sm">
                  <SelectValue placeholder="Hour" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {hours.map(hour => (
                    <SelectItem key={hour} value={hour}>
                      {parseInt(hour) > 12 ? `${parseInt(hour) - 12} PM` : `${hour} AM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMinute} onValueChange={onMinuteSelect}>
                <SelectTrigger className="border-[#146C94]/20 h-10 md:h-11 bg-[#146C94]/5 rounded-lg text-sm">
                  <SelectValue placeholder="Minutes" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {minutes.map(minute => (
                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Patient Selection */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[#146C94] font-medium text-sm">Select Patient</Label>
            <Select value={selectedPatient} onValueChange={onPatientSelect}>
              <SelectTrigger className="border-[#146C94]/20 h-10 md:h-11 bg-[#146C94]/5 rounded-lg text-sm">
                <SelectValue placeholder="Choose a patient" />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-[35vh] overflow-y-auto">
                {patients.map(patient => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Type */}
          <div className="space-y-2 md:space-y-3">
            <Label className="text-[#146C94] font-medium text-sm">Session Type</Label>
            <RadioGroup 
              defaultValue={sessionType} 
              value={sessionType}
              onValueChange={onSessionTypeChange}
              className="flex gap-3"
            >
              <div className="flex items-center space-x-2 bg-[#146C94]/5 rounded-lg p-2 md:p-3 flex-1 cursor-pointer border border-transparent hover:border-[#146C94]/20">
                <RadioGroupItem value="Individual Session" id="individual" className="text-[#146C94]" />
                <Label htmlFor="individual" className="cursor-pointer text-sm">Individual</Label>
              </div>
              <div className="flex items-center space-x-2 bg-[#146C94]/5 rounded-lg p-2 md:p-3 flex-1 cursor-pointer border border-transparent hover:border-[#146C94]/20">
                <RadioGroupItem value="Group Session" id="group" className="text-[#146C94]" />
                <Label htmlFor="group" className="cursor-pointer text-sm">Group</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={onBookAppointment} 
            className="w-full bg-[#146C94] hover:bg-[#146C94]/90 rounded-full py-4 md:py-5 text-white font-medium text-sm md:text-base transition-all duration-200"
            disabled={!selectedDate || !selectedHour || !selectedMinute || !selectedPatient}
          >
            Schedule Appointment
          </Button>
        </TabsContent>

        {/* Pending Requests Tab */}
        <TabsContent value="requests" className="space-y-1 max-h-[50vh] overflow-y-auto">
          {appointmentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="mx-auto h-10 w-10 opacity-50 mb-2" />
              <p className="text-sm">No pending appointment requests</p>
            </div>
          ) : (
            appointmentRequests.map((request) => (
              <div 
                key={request.id}
                className="p-3 md:p-4 border border-[#146C94]/10 rounded-lg bg-[#146C94]/5 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 md:h-5 md:w-5 text-[#146C94]" />
                    <h3 className="font-medium text-[#146C94] text-sm">{request.patientName}</h3>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    Pending
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
                    <span>{format(request.sessionDate, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
                    <span>{format(request.sessionDate, "h:mm a")}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-1">
                  <Button 
                    className="flex-1 bg-green-100 hover:bg-green-200 text-green-800 border-none text-xs md:text-sm h-8 md:h-9"
                    onClick={() => onConfirmAppointment(request.id)}
                  >
                    <Check className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Confirm
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-200 text-red-800 hover:bg-red-50 text-xs md:text-sm h-8 md:h-9"
                    onClick={() => onDeclineAppointment(request.id)}
                  >
                    <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    Decline
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </DialogContent>
  );
};
 
export default TherapistBookingDialog;