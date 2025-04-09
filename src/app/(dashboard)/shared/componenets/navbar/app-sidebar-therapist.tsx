"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from 'next/image'
import {
  Home,
  Calendar,
  Users,
  ClipboardList,
  Settings,
  UserCircle,
  BellRing,
  LogOut,
  MessageSquare,
  Notebook
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/app/utils/firebase/config"
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  getDocs,
  where,
  orderBy,
  limit,
  Firestore
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"

import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Session, UserProfile } from "@/app/(dashboard)/shared/types/interfaces"

// Define interface for navigation items
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  className?: string;
}

const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/therapist",
    icon: Home
  },
  {
    title: "Schedule",
    url: "/therapist/schedule",
    icon: Calendar
  },
  {
    title: "Patients",
    url: "/therapist/patients",
    icon: Users
  },
  {
    title: "Notes",
    url: "/therapist/notes",
    icon: ClipboardList
  },
  {
    title: "Sessions",
    url: "/therapist/sessions",
    icon: Notebook
  },
  {
    title: "Messages",
    url: "/therapist/messages",
    icon: MessageSquare,
    badge: "3"
  }
]

const settingsNavItems: NavItem[] = [
  {
    title: "Settings",
    url: "/therapist/settings",
    icon: Settings
  },
  {
    title: "Logout",
    url: "/logout",
    icon: LogOut,
    className: "text-red-600 hover:bg-red-50"
  }
]

export function TherapistSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
  const [patientCount, setPatientCount] = React.useState<number>(0)
  const [scheduleCount, setScheduleCount] = React.useState<number>(0)
  const [nextSession, setNextSession] = React.useState<Session | null>(null)

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getFirestore()
        const userDocRef = doc(db, "users", user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          setUserProfile({
            email: userData.email || user.email || "",
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            role: userData.role || "therapist"
          })
        } else {
          setUserProfile(null)
        }

        // Fetch counts and next session
        await fetchPatientCount(user.uid, db)
        await fetchScheduleCount(user.uid, db)
        await fetchNextSession(user.uid, db)
      } else {
        setUserProfile(null)
        setPatientCount(0)
        setScheduleCount(0)
        setNextSession(null)
      }
    })

    return () => unsubscribe()
  }, [])

  // Function to fetch patient count
  const fetchPatientCount = async (therapistId: string, db: Firestore) => {
    try {
      const sessionsRef = collection(db, "sessions")
      const q = query(
        sessionsRef,
        where("therapistId", "==", therapistId)
      )
      const querySnapshot = await getDocs(q)

      const patientIds = new Set<string>()
      querySnapshot.forEach(doc => {
        patientIds.add(doc.data().patientId)
      })

      setPatientCount(patientIds.size)
    } catch (error) {
      console.error("Error fetching patient count:", error)
      setPatientCount(0)
    }
  }

  // Function to fetch total schedule count
  const fetchScheduleCount = async (therapistId: string, db: Firestore) => {
    try {
      const sessionsRef = collection(db, "sessions")
      const q = query(
        sessionsRef,
        where("therapistId", "==", therapistId)
      )
      const querySnapshot = await getDocs(q)
      setScheduleCount(querySnapshot.size)
    } catch (error) {
      console.error("Error fetching schedule count:", error)
      setScheduleCount(0)
    }
  }

  // Function to fetch next session
  const fetchNextSession = async (therapistId: string, db: Firestore) => {
    try {
      const now = new Date()
      const sessionsRef = collection(db, "sessions")
      const q = query(
        sessionsRef,
        where("therapistId", "==", therapistId),
        where("sessionDate", ">=", now),
        orderBy("sessionDate", "asc"),
        limit(1)
      )
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        const data = docSnap.data()

        // Create a complete Session object with all required fields
        const session: Session = {
          id: docSnap.id,
          sessionDate: data.sessionDate.toDate(),
          therapist: data.therapist || "",
          therapistId: data.therapistId || "",
          patientId: data.patientId || "",
          status: data.status || "",
          summary: data.summary || "",
          shortSummary: data.shortSummary || "",
          keyPoints: data.keyPoints || [],
          insights: data.insights || [],
          mood: data.mood || "",
          progress: data.progress || "",
          goals: data.goals || [],
          warnings: data.warnings || [],
          transcript: data.transcript || "",
          journalingPrompt: data.journalingPrompt || "",
          journalingResponse: data.journalingResponse || "",
          patientName: ""
        }

        // Fetch patient name
        const patientRef = doc(db, "users", session.patientId)
        const patientSnap = await getDoc(patientRef)
        if (patientSnap.exists()) {
          const patientData = patientSnap.data()
          session.patientName = `${patientData.first_name || ''} ${patientData.last_name || ''}`.trim()
        }

        setNextSession(session)
      } else {
        setNextSession(null)
      }
    } catch (error) {
      console.error("Error fetching next session:", error)
      setNextSession(null)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      await signOut(auth)
      window.location.href = '/signin'
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  const fullName = userProfile
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : "Loading..."

  const userRole = userProfile?.role
    ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)
    : "Therapist"

  // Format session date
  const formatSessionDate = (date: Date): string => {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    if (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    ) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (
      date.getFullYear() === tomorrow.getFullYear() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getDate() === tomorrow.getDate()
    ) {
      return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  // Check if a path is active (also handles sub-paths)
  const isActive = (path: string): boolean => {
    // Exact match for home page
    if (path === "/therapist" && pathname === "/therapist") {
      return true;
    }
    // For other paths, check if the current path starts with the nav item path
    // But only if the nav item path is not just "/therapist"
    return path !== "/therapist" && pathname.startsWith(path);
  };

  // Update navigation items with dynamic badges
  const updatedMainNavItems = mainNavItems.map(item => {
    if (item.title === "Patients") {
      return {
        ...item,
        badge: patientCount > 0 ? patientCount.toString() : undefined
      }
    }
    if (item.title === "Schedule") {
      return {
        ...item,
        badge: scheduleCount > 0 ? scheduleCount.toString() : undefined
      }
    }
    return item
  })

  return (
    <Sidebar className="flex flex-col h-screen">
      <SidebarHeader className="px-4 py-6 border-b">
        <Link href="/therapist" className="flex items-center gap-3">
          <Image
            src="/logo/therapyAI-black.png"
            alt="TherapyAI"
            width={1980}
            height={1080}
            className="h-8 w-auto"
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="flex-1 flex flex-col">
        <div className="px-4 py-4 border-b">
          <div className="rounded-lg bg-[#146C94]/5 p-4">
            <div className="flex items-center gap-3 text-[#146C94]">
              <BellRing className="h-5 w-5" />
              <span className="text-sm font-medium">Next Session</span>
            </div>
            <p className="mt-2 text-sm text-[#146C94]/70">
              {nextSession
                ? `${formatSessionDate(nextSession.sessionDate)} with ${nextSession.patientName || "a patient"}`
                : "No upcoming sessions"}
            </p>
            {nextSession && (
              <Link
                href={`/therapist/sessions/${nextSession.id}`}
                className="mt-2 text-xs font-medium text-[#146C94] hover:underline inline-block"
              >
                View details
              </Link>
            )}
          </div>
        </div>

        <SidebarGroup className="flex-1 px-3 py-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {updatedMainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      w-full p-3 rounded-lg transition-colors duration-200
                      ${isActive(item.url)
                        ? 'bg-[#146C94] text-white'
                        : 'text-[#146C94] hover:bg-[#146C94]/10'}
                    `}
                  >
                    <Link href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={`ml-2 ${isActive(item.url)
                            ? 'border-white text-white'
                            : 'border-[#146C94] text-[#146C94]'}`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto border-t">
          <div className="p-4 border-b">
            <div className="flex items-center gap-3 rounded-lg hover:bg-[#146C94]/5 p-3 cursor-pointer transition-colors duration-200">
              <div className="h-10 w-10 rounded-full bg-[#146C94]/10 flex items-center justify-center">
                <UserCircle className="h-6 w-6 text-[#146C94]" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[#146C94]">
                  {fullName}
                </span>
                <span className="text-xs text-[#146C94]/70">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          <div className="p-2">
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className={`
                      w-full p-3 rounded-lg transition-colors duration-200
                      ${item.className || (isActive(item.url)
                        ? 'bg-[#146C94] text-white'
                        : 'text-[#146C94] hover:bg-[#146C94]/10')}
                    `}
                  >
                    {item.url === '/logout' ? (
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </button>
                    ) : (
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}