"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Video,
  Clock,
  Search,
  Filter,
  CalendarIcon,
  List,
  X,
  Users,
  FileText,
  Plus
} from "lucide-react"
import { auth } from "@/app/utils/firebase/config"
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Firestore,
  Timestamp
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import TherapistBookingDialog from "./componenets/TherapistBookingDialog"

interface Session {
  id: string;
  sessionDate: Date;
  patientId: string;
  patientName: string;
  type: string;
  status: string;
  time: string;
}

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

export default function TherapistSchedulePage() {
  const router = useRouter()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [filter, setFilter] = useState("all")
  const [sessions, setSessions] = useState<Session[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list") // Default to list on mobile
  const [showCalendarOnMobile, setShowCalendarOnMobile] = useState(false)
  const [open, setOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedHour, setSelectedHour] = useState<string>("")
  const [selectedMinute, setSelectedMinute] = useState<string>("")
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [sessionType, setSessionType] = useState<string>("Individual Session")
  const [successMessage, setSuccessMessage] = useState<string>("")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore()
        await Promise.all([
          fetchSessions(user.uid, db),
          fetchPatients(db),
          fetchAppointmentRequests(user.uid, db)
        ])
      } else {
        setSessions([])
        setPatients([])
        setAppointmentRequests([])
      }
      setLoading(false)
    })

    // Set initial view mode based on screen size
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("list")
      }
    }
    
    // Initialize
    handleResize()
    
    // Listen for resize events
    window.addEventListener('resize', handleResize)

    return () => {
      unsubscribe()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const fetchSessions = async (therapistId: string, db: Firestore) => {
    try {
      const sessionsRef = collection(db, "sessions")
      const q = query(
        sessionsRef,
        where("therapistId", "==", therapistId)
      )
      const querySnapshot = await getDocs(q)
      
      const sessionList: Session[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          const sessionDate = data.sessionDate.toDate()
          
          const patientRef = doc(db, "users", data.patientId)
          const patientSnap = await getDoc(patientRef)
          const patientData = patientSnap.exists() ? patientSnap.data() : {}
          const patientName = patientData.first_name && patientData.last_name
            ? `${patientData.first_name} ${patientData.last_name}`
            : "Unknown Patient"

          return {
            id: docSnap.id,
            sessionDate,
            patientId: data.patientId,
            patientName,
            type: data.type || "Individual Session",
            status: data.status || "upcoming",
            time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        })
      )

      setSessions(sessionList.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime()))
    } catch (error) {
      console.error("Error fetching sessions:", error)
      setSessions([])
    }
  }

  const fetchPatients = async (db: Firestore) => {
    try {
      const patientsRef = collection(db, "users")
      const q = query(
        patientsRef,
        where("role", "==", "patient")
      )
      const querySnapshot = await getDocs(q)
      
      const patientList: Patient[] = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          first_name: data.first_name || "",
          last_name: data.last_name || ""
        }
      })

      setPatients(patientList.sort((a, b) => a.last_name.localeCompare(b.last_name)))
    } catch (error) {
      console.error("Error fetching patients:", error)
      setPatients([])
    }
  }

  const fetchAppointmentRequests = async (therapistId: string, db: Firestore) => {
    try {
      const requestsRef = collection(db, "appointmentRequests")
      const q = query(
        requestsRef,
        where("therapistId", "==", therapistId),
        where("status", "==", "pending")
      )
      const querySnapshot = await getDocs(q)
      
      const requestList: AppointmentRequest[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data()
          const sessionDate = data.sessionDate.toDate()
          
          const patientRef = doc(db, "users", data.patientId)
          const patientSnap = await getDoc(patientRef)
          const patientData = patientSnap.exists() ? patientSnap.data() : {}
          const patientName = patientData.first_name && patientData.last_name
            ? `${patientData.first_name} ${patientData.last_name}`
            : "Unknown Patient"

          return {
            id: docSnap.id,
            sessionDate,
            patientId: data.patientId,
            patientName,
            status: data.status || "pending"
          }
        })
      )

      setAppointmentRequests(requestList)
    } catch (error) {
      console.error("Error fetching appointment requests:", error)
      setAppointmentRequests([])
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedHour || !selectedMinute || !selectedPatient) {
      alert("Please fill all fields.")
      return
    }

    const currentUser = auth.currentUser
    if (!currentUser) return

    const db = getFirestore()
    const sessionDate = new Date(selectedDate)
    sessionDate.setHours(parseInt(selectedHour), parseInt(selectedMinute))

    const timeFormatted = `${selectedHour.padStart(2, '0')}:${selectedMinute.padStart(2, '0')}`

    // Get patient details
    const patient = patients.find(p => p.id === selectedPatient)
    if (!patient) {
      alert("Selected patient not found.")
      return
    }

    // Create new session document
    const newSession = {
      sessionDate: Timestamp.fromDate(sessionDate),
      therapistId: currentUser.uid,
      patientId: selectedPatient,
      type: sessionType,
      summary: `${sessionType} with ${patient.first_name} ${patient.last_name}`,
      keyPoints: [],
      insights: [],
      mood: 'Neutral',
      progress: 'Upcoming',
      goals: [],
      warnings: [],
      transcript: '',
      journalingPrompt: '',
      journalingResponse: '',
      status: 'upcoming',
    }

    try {
      const sessionRef = doc(collection(db, "sessions"))
      await setDoc(sessionRef, newSession)
      
      // Add the new session to the state
      const newSessionWithDetails: Session = {
        id: sessionRef.id,
        sessionDate,
        patientId: selectedPatient,
        patientName: `${patient.first_name} ${patient.last_name}`,
        type: sessionType,
        status: 'upcoming',
        time: sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setSessions([...sessions, newSessionWithDetails])
      
      // Reset the form
      setOpen(false)
      setSelectedDate(new Date())
      setSelectedHour("")
      setSelectedMinute("")
      setSelectedPatient("")
      setSessionType("Individual Session")
      
      // Show success message
      setSuccessMessage(`Appointment scheduled with ${patient.first_name} ${patient.last_name} for ${sessionDate.toLocaleDateString()} at ${timeFormatted}.`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error booking appointment:", error)
      alert("Failed to schedule appointment.")
    }
  }
  
  const handleConfirmAppointment = async (appointmentId: string) => {
    const currentUser = auth.currentUser
    if (!currentUser) return

    const db = getFirestore()
    
    try {
      // Get the appointment request
      const appointmentRequest = appointmentRequests.find(req => req.id === appointmentId)
      if (!appointmentRequest) {
        alert("Appointment request not found.")
        return
      }
      
      // Create a new session based on the request
      const newSession = {
        sessionDate: Timestamp.fromDate(appointmentRequest.sessionDate),
        therapistId: currentUser.uid,
        patientId: appointmentRequest.patientId,
        type: "Individual Session",
        summary: `Session with ${appointmentRequest.patientName}`,
        keyPoints: [],
        insights: [],
        mood: 'Neutral',
        progress: 'Upcoming',
        goals: [],
        warnings: [],
        transcript: '',
        journalingPrompt: '',
        journalingResponse: '',
        status: 'upcoming',
      }
      
      // Add it to the sessions collection
      const sessionRef = doc(collection(db, "sessions"))
      await setDoc(sessionRef, newSession)
      
      // Update the request status
      const requestRef = doc(db, "appointmentRequests", appointmentId)
      await updateDoc(requestRef, {
        status: "confirmed"
      })
      
      // Update local state
      const newSessionWithDetails: Session = {
        id: sessionRef.id,
        sessionDate: appointmentRequest.sessionDate,
        patientId: appointmentRequest.patientId,
        patientName: appointmentRequest.patientName,
        type: "Individual Session",
        status: 'upcoming',
        time: appointmentRequest.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setSessions([...sessions, newSessionWithDetails])
      setAppointmentRequests(appointmentRequests.filter(req => req.id !== appointmentId))
      
      // Show success message
      setSuccessMessage(`Appointment with ${appointmentRequest.patientName} confirmed.`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error confirming appointment:", error)
      alert("Failed to confirm appointment.")
    }
  }
  
  const handleDeclineAppointment = async (appointmentId: string) => {
    const db = getFirestore()
    
    try {
      // Get the appointment request
      const appointmentRequest = appointmentRequests.find(req => req.id === appointmentId)
      if (!appointmentRequest) {
        alert("Appointment request not found.")
        return
      }
      
      // Update the request status
      const requestRef = doc(db, "appointmentRequests", appointmentId)
      await updateDoc(requestRef, {
        status: "declined"
      })
      
      // Update local state
      setAppointmentRequests(appointmentRequests.filter(req => req.id !== appointmentId))
      
      // Show success message
      setSuccessMessage(`Appointment request from ${appointmentRequest.patientName} declined.`)
      setTimeout(() => setSuccessMessage(""), 5000)
    } catch (error) {
      console.error("Error declining appointment:", error)
      alert("Failed to decline appointment.")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      upcoming: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      default: "bg-gray-100 text-gray-800"
    }
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.default
  }

  // Check if a session is happening now
  const isInProgress = (session: Session) => {
    const now = new Date();
    const sessionStart = new Date(session.sessionDate);
    const sessionEnd = new Date(session.sessionDate);
    sessionEnd.setHours(sessionEnd.getHours() + 1); // Assuming 1 hour sessions
    
    return now >= sessionStart && now <= sessionEnd;
  }

  // Get appropriate badge text
  const getBadgeText = (session: Session) => {
    if (session.status === "completed") return "Completed";
    if (isInProgress(session)) return "In Progress";
    return session.status.charAt(0).toUpperCase() + session.status.slice(1);
  }

  // Get appropriate badge class
  const getBadgeClass = (session: Session) => {
    if (session.status === "completed") return "bg-green-100 text-green-800";
    if (isInProgress(session)) return "bg-blue-100 text-blue-800";
    return getStatusBadge(session.status);
  }

  const handleViewDetails = (id: string) => {
    router.push(`/therapist/sessions/${id}`)
  }

  const filteredSessions = sessions
    .filter(session => {
      const matchesFilter = filter === "all" || session.status === filter
      const matchesSearch = session.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          session.type.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesDate = !date || 
        (session.sessionDate.toDateString() === date.toDateString())
      
      return matchesFilter && matchesSearch && matchesDate
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-[#146C94] animate-pulse">Loading schedule...</div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-6 right-6 bg-green-50 text-green-700 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in max-w-xs md:max-w-md">
          {successMessage}
        </div>
      )}
      
      {/* Header */}
      <div className="mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#146C94]">Therapist Schedule</h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1">Manage your therapy sessions and appointments</p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setViewMode("calendar")
                setShowCalendarOnMobile(true)
              }}
              className="rounded-md text-xs md:text-sm"
            >
              <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden md:inline">Calendar</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-md text-xs md:text-sm"
            >
              <List className="h-3 w-3 md:h-4 md:w-4 mr-1" />
              <span className="hidden md:inline">List</span>
            </Button>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#146C94] hover:bg-[#146C94]/90 rounded-lg text-xs md:text-sm">
                <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden md:inline">Manage Appointments</span>
                <span className="inline md:hidden">Manage</span>
                {appointmentRequests.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    {appointmentRequests.length}
                  </span>
                )}
              </Button>
            </DialogTrigger>
            <TherapistBookingDialog
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              selectedHour={selectedHour}
              onHourSelect={setSelectedHour}
              selectedMinute={selectedMinute}
              onMinuteSelect={setSelectedMinute}
              selectedPatient={selectedPatient}
              onPatientSelect={setSelectedPatient}
              patients={patients}
              appointmentRequests={appointmentRequests}
              onBookAppointment={handleBookAppointment}
              onConfirmAppointment={handleConfirmAppointment}
              onDeclineAppointment={handleDeclineAppointment}
              sessionType={sessionType}
              onSessionTypeChange={setSessionType}
            />
          </Dialog>
        </div>
      </div>

      {/* Search and filters for mobile */}
      <div className="mb-4 space-y-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 text-xs md:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#146C94] focus:border-transparent w-full"
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-3 w-3 md:h-4 md:w-4" />
            </button>
          )}
        </div>
        
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
              className="text-xs whitespace-nowrap"
            >
              All
            </Button>
            <Button
              variant={filter === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("upcoming")}
              className="text-xs whitespace-nowrap"
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "completed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("completed")}
              className="text-xs whitespace-nowrap"
            >
              Completed
            </Button>
            <Button
              variant={filter === "cancelled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("cancelled")}
              className="text-xs whitespace-nowrap"
            >
              Cancelled
            </Button>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid md:grid-cols-12 gap-4 md:gap-6">
        {/* Calendar Sidebar - Hide on mobile by default unless explicitly shown */}
        {(showCalendarOnMobile || window.innerWidth >= 768) && (
          <Card className="md:col-span-4 bg-white border-gray-200">
            <CardHeader className="border-b border-gray-200 py-3 px-4 md:p-6">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base md:text-lg font-semibold text-[#146C94]">
                  Calendar
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden"
                  onClick={() => setShowCalendarOnMobile(false)}
                >
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-2 md:pt-4 flex flex-col items-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate)
                  // On mobile, auto-close calendar after selecting a date
                  if (window.innerWidth < 768) {
                    setShowCalendarOnMobile(false)
                  }
                }}
                className="rounded-md border-gray-200"
              />
              {date && (
                <Button
                  variant="ghost"
                  className="mt-2 md:mt-4 text-xs md:text-sm w-full md:w-64"
                  onClick={() => setDate(undefined)}
                >
                  Clear date filter
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sessions List Section */}
        <div className={`${showCalendarOnMobile && window.innerWidth < 768 ? 'hidden' : ''} md:col-span-8`}>
          <Card className="bg-white shadow-sm rounded-xl border border-gray-200">
            <CardHeader className="border-b border-gray-200 py-3 px-4 md:p-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg font-semibold text-[#146C94]">
                  {date 
                    ? `Sessions on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` 
                    : "All Sessions"}
                  {filteredSessions.length > 0 && <span className="text-sm font-normal text-gray-500 ml-1">({filteredSessions.length})</span>}
                </CardTitle>
                
                {/* Show calendar button on mobile */}
                {!showCalendarOnMobile && window.innerWidth < 768 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowCalendarOnMobile(true)}
                    className="text-xs"
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Calendar
                  </Button>
                )}
                
                {/* Filter dropdown for desktop only */}
                <div className="hidden md:block">
                  <Select 
                    value={filter} 
                    onValueChange={setFilter}
                  >
                    <SelectTrigger className="w-40 text-sm border-[#146C94]/20">
                      <Filter className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-3 md:p-6">
              <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 md:pr-2 -mr-1 md:-mr-2 pb-1">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-6 md:py-10 text-gray-500 flex flex-col items-center">
                    <FileText className="mx-auto h-10 w-10 md:h-12 md:w-12 opacity-50 mb-3 md:mb-4" />
                    <p className="text-sm md:text-base">
                      {date 
                        ? `No sessions on ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` 
                        : searchQuery 
                        ? "No sessions match your search" 
                        : "No sessions found"}
                    </p>
                    <p className="text-xs md:text-sm text-gray-400 mt-1">
                      {searchQuery ? "Try adjusting your search terms" : "Your schedule is clear"}
                    </p>
                    
                    {/* Add Schedule button in empty state */}
                    <Dialog open={open} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="mt-4 bg-[#146C94] hover:bg-[#146C94]/90 text-white text-xs md:text-sm"
                        >
                          <Plus className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                          Schedule New Session
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                ) : (
                  <div className="space-y-2 md:space-y-4">
                    {filteredSessions.map((session) => (
                      <div 
                        key={session.id}
                        className="block transition-all duration-200 hover:translate-x-1"
                        onClick={() => handleViewDetails(session.id)}
                      >
                        <div className="flex items-center gap-3 p-3 md:p-4 bg-[#146C94]/5 rounded-lg hover:bg-[#146C94]/10 transition-colors border border-[#146C94]/10 cursor-pointer">
                          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-[#146C94]/20 flex items-center justify-center flex-shrink-0">
                            {session.type.includes("Group") 
                              ? <Users className="h-4 w-4 md:h-5 md:w-5 text-[#146C94]" />
                              : <Video className="h-4 w-4 md:h-5 md:w-5 text-[#146C94]" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-medium text-[#146C94] truncate text-sm md:text-base">{session.patientName}</h3>
                            </div>
                            <div className="mt-1 md:mt-2 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-xs md:text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
                                <span>{session.sessionDate.toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric'
                                })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 md:h-4 md:w-4 text-[#146C94]" />
                                <span>{session.time}</span>
                              </div>
                              <span className="hidden md:inline text-xs font-medium text-[#146C94]/80">{session.type}</span>
                            </div>
                          </div>
                          <Badge className={`text-xs whitespace-nowrap ${getBadgeClass(session)}`}>
                            {getBadgeText(session)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
