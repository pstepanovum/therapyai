/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { getFirestore, collection, query, where, getDocs, doc, getDoc, Firestore } from "firebase/firestore"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  Plus,
  ArrowRight,
  CalendarDays,
  Bell,
  CheckCircle2,
  HeartPulse,
  UserCircle,
  Brain
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"

// Helper function to get greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return "Good Morning"
  if (hour < 17) return "Good Afternoon"
  return "Good Evening"
}

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
]

// Interface for session data
interface Session {
  id: string;
  sessionDate: Date;
  therapistId: string;
  therapist: string;
  summary: string;
  shortSummary?: string;
  status: string;
  patientId: string;
}

// Interface for notification
interface Notification {
  id: string;
  type: 'session' | 'journal' | 'message';
  title: string;
  description: string;
  date: Date;
  read: boolean;
}

// Interface for mood entry
interface MoodEntry {
  date: Date;
  value: number;
  notes: string;
}

export default function PatientDashboard() {
  const [greeting, setGreeting] = useState("")
  const [quote, setQuote] = useState(quotes[0])
  const [userName, setUserName] = useState("User")
  const [nextSession, setNextSession] = useState<Session | null>(null)
  const [lastSession, setLastSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [journalStreak, setJournalStreak] = useState(0)
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([])
  const [goalsProgress, setGoalsProgress] = useState(68) // Sample progress percentage
  const router = useRouter()

  // Function to fetch therapist name with proper Firestore type
  const getTherapistName = async (therapistId: string, db: Firestore): Promise<string> => {
    const therapistRef = doc(db, "users", therapistId)
    const therapistSnap = await getDoc(therapistRef)
    return therapistSnap.exists() ? `Dr. ${therapistSnap.data().last_name}` : "Unknown Therapist"
  }

  // Function to get status color for mood value
  const getMoodColor = (value: number) => {
    if (value >= 4) return "text-green-500"
    if (value >= 3) return "text-blue-500"
    if (value >= 2) return "text-yellow-500"
    return "text-red-500"
  }

  useEffect(() => {
    setGreeting(getGreeting())
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(randomQuote)

    const interval = setInterval(() => {
      setGreeting(getGreeting())
    }, 60000)

    const auth = getAuth()
    const db = getFirestore()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const uid = user.uid
          const userDocRef = doc(db, "users", uid)
          const userDocSnap = await getDoc(userDocRef)
          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            setUserName(data.first_name ? 
              data.first_name.charAt(0).toUpperCase() + data.first_name.slice(1) : 
              user.email ? user.email.split("@")[0] : "User")
          }

          const sessionsRef = collection(db, "sessions")
          const q = query(sessionsRef, where("patientId", "==", uid))
          const querySnapshot = await getDocs(q)
          const fetchedSessions: Session[] = await Promise.all(
            querySnapshot.docs.map(async (sessionDoc) => {
              const data = sessionDoc.data()
              const therapistName = await getTherapistName(data.therapistId, db)
              return {
                id: sessionDoc.id,
                sessionDate: data.sessionDate.toDate(),
                therapistId: data.therapistId,
                therapist: therapistName,
                summary: data.summary || "No summary available",
                shortSummary: data.shortSummary || "",
                status: data.status || "unknown",
                patientId: data.patientId,
              }
            })
          )

          fetchedSessions.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime())
          const now = new Date()
          const upcoming = fetchedSessions.find(session => session.sessionDate > now && session.status === "scheduled")
          setNextSession(upcoming || null)
          const pastSessions = fetchedSessions.filter(session => session.sessionDate <= now)
          const recentPast = pastSessions[pastSessions.length - 1]
          setLastSession(recentPast || null)

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
          ]
          setNotifications(mockNotifications)

          // Mock data for journal streak
          setJournalStreak(4)

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
          ]
          setRecentMoods(mockMoods)

        } catch (error) {
          console.error("Error fetching data:", error)
        } finally {
          setLoading(false)
        }
      } else {
        setUserName("Guest")
        setLoading(false)
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'journal':
        return <BookOpen className="h-4 w-4 text-green-500" />
      case 'message':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section with Welcome and Quote */}
        <div className="mb-8 rounded-xl p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#146C94]">
                {greeting}, {userName}
              </h1>
              <p className="text-gray-600 mt-2">
                We&apos;re here to support your journey to better mental health
              </p>
            </div>
            <div className="bg-[#146C94]/5 p-4 rounded-lg max-w-md">
              <blockquote className="space-y-2">
                <p className="text-lg text-[#146C94] italic">&quot;{quote.text}&quot;</p>
                <footer className="text-sm text-[#146C94]/70 text-right">
                  — {quote.author}
                </footer>
              </blockquote>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
                onClick={() => router.push("/patient/schedule")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Schedule Appointment
              </Button>
            </CardContent>
          </Card>

          <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardContent className="pt-6">
              <Link href="/patient/journal" className="w-full">
                <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
                  <BookOpen className="mr-2 h-4 w-4" />
                  New Journal Entry
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardContent className="pt-6">
              <Button 
                className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
                onClick={() => router.push("/patient/messages")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Message Therapist
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Next Session Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#146C94]" />
                    Next Therapy Session
                  </div>
                  {nextSession && (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Upcoming
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Your upcoming appointment details
                </CardDescription>
              </CardHeader>
              <CardContent>
                {nextSession ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <UserCircle className="h-5 w-5 text-[#146C94]" />
                          <span className="font-medium">{nextSession.therapist}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <CalendarDays className="h-4 w-4" />
                          <span>{nextSession.sessionDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{nextSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/rooms/${nextSession.id}`} 
                        className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200"
                      >
                        Join Session
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                    <div className="flex flex-col gap-2">
                      <h4 className="text-sm font-medium text-gray-700">Preparation Tips:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 list-inside list-disc">
                        <li>Find a quiet, private space for your session</li>
                        <li>Test your camera and microphone beforehand</li>
                        <li>Consider topics you&apos;d like to discuss today</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 space-y-3">
                    <p className="text-gray-600 text-center">You don&apos;t have any upcoming sessions scheduled.</p>
                    <Button 
                      onClick={() => router.push("/patient/schedule")}
                      className="bg-[#146C94] hover:bg-[#146C94]/90"
                    >
                      Schedule Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Last Session Summary Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#146C94]" />
                  Previous Session Summary
                </CardTitle>
                <CardDescription>
                  Recap and insights from your last therapy session
                </CardDescription>
              </CardHeader>
              <CardContent>
                {lastSession ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span>{lastSession.sessionDate.toLocaleDateString()}</span>
                      </div>
                      <div>with {lastSession.therapist}</div>
                    </div>
                    <div className="bg-[#F8FBFF] p-4 rounded-lg border border-blue-100">
                      <h4 className="font-medium text-[#146C94] mb-2">Key Points:</h4>
                      <p className="text-gray-700">{lastSession.summary}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                      onClick={() => router.push(`/patient/sessions/${lastSession.id}`)}
                    >
                      View Complete Session Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 py-4">No past sessions available yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Goals Progress */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#146C94]" />
                  Your Therapy Goals
                </CardTitle>
                <CardDescription>
                  Track your progress on current therapy goals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">Overall Progress</h4>
                      <span className="text-[#146C94] font-medium">{goalsProgress}%</span>
                    </div>
                    <Progress value={goalsProgress} className="h-2 bg-[#AFD3E2]/30 [&>div]:bg-[#146C94]" />
                    Schedule Appointment
                    </div>
                  
                  <div className="space-y-3 pt-2">
                    <h4 className="font-medium text-gray-700">Current Goals:</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm">Practice daily mindfulness meditation</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">75%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Improve sleep hygiene routine</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">60%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                          <span className="text-sm">Practice assertive communication</span>
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">45%</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                    onClick={() => router.push("/patient/goals")}
                  >
                    View All Goals & Progress
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Mood Tracker Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-[#146C94]" />
                  Mood Tracker
                </CardTitle>
                <CardDescription>
                  Your mood patterns over the past week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-end px-2">
                    {recentMoods.map((mood, index) => (
                      <div key={index} className="flex flex-col items-center space-y-1 -mx-1">
                        <div className={`text-sm font-medium ${getMoodColor(mood.value)}`}>
                          {mood.value}
                        </div>
                        <div className={`w-4 h-${mood.value * 4} rounded-t-sm ${
                          mood.value >= 4 ? "bg-green-500" :
                          mood.value >= 3 ? "bg-blue-500" :
                          mood.value >= 2 ? "bg-yellow-500" : "bg-red-500"
                        }`}></div>
                        <div className="text-xs text-gray-500 -rotate-90 h-6 w-6 flex items-center justify-center">
                          {mood.date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500 px-2">
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                    <div>Today</div>
                  </div>
                  
                  <div className="flex justify-between bg-[#F8FBFF] p-3 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 text-[#146C94]" />
                      <span className="font-medium">Current trend:</span>
                    </div>
                    <div className="text-green-600 font-medium">Improving</div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                    onClick={() => router.push("/patient/mood")}
                  >
                    Log Today&apos;s Mood
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Journal Streak Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#146C94]" />
                  Journal Streak
                </CardTitle>
                <CardDescription>
                  Keep up your journaling habit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                          strokeDasharray="100, 100"
                        />
                        <path
                          d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#146C94"
                          strokeWidth="3"
                          strokeDasharray={`${journalStreak * 25}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-[#146C94]">{journalStreak}</span>
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#F8FBFF] p-3 rounded-lg">
                    <p className="text-sm text-center text-gray-700">
                      {journalStreak === 0 
                        ? "Start journaling today to build your streak!" 
                        : `You've been journaling for ${journalStreak} days in a row. Great job!`}
                    </p>
                  </div>
                  
                  <Link href="/patient/journal">
                    <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
                      Write in Journal
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#146C94]" />
                    Notifications
                  </div>
                  <Badge className="bg-red-100 text-red-800">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Your latest updates and reminders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-600 text-center py-3">No notifications</p>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} border ${notification.read ? 'border-gray-100' : 'border-blue-200'}`}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm">{notification.title}</h4>
                              <span className="text-xs text-gray-500">
                                {notification.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{notification.description}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 pb-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-[#146C94] hover:bg-[#146C94]/10"
                  onClick={() => router.push("/patient/notifications")}
                >
                  View All Notifications
                </Button>
              </CardFooter>
            </Card>
            
            {/* Resources Card */}
            <Card className="border-[#AFD3E2] bg-white overflow-hidden">
              <div className="h-1"></div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-[#146C94]" />
                  Wellness Resources
                </CardTitle>
                <CardDescription>
                  Helpful materials for your journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-md flex-shrink-0">
                      <Brain className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Mindfulness Guide</h4>
                      <p className="text-xs text-gray-600">Quick techniques for stress reduction</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-green-100 rounded-md flex-shrink-0">
                      <HeartPulse className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Sleep Improvement</h4>
                      <p className="text-xs text-gray-600">Tips for better sleep quality</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-md flex-shrink-0">
                      <UserCircle className="h-5 w-5 text-purple-700" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">Building Relationships</h4>
                      <p className="text-xs text-gray-600">Healthy communication skills</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-3 pb-3">
                <Button 
                  variant="ghost" 
                  className="w-full text-[#146C94] hover:bg-[#146C94]/10"
                  onClick={() => router.push("/patient/resources")}
                >
                  Browse All Resources
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}