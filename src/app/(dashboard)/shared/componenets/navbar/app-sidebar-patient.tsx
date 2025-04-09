/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from 'next/image'
import { 
  Home,
  Calendar,
  BookOpen,
  Settings,
  UserCircle,
  BellRing,
  LogOut, 
  Armchair,
  MessageSquare
} from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/app/utils/firebase/config"
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs 
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

// Define an interface for navigation items
interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
  className?: string;
}

const mainNavItems: NavItem[] = [
  { 
    title: "Home",
    url: "/patient",
    icon: Home
  },
  { 
    title: "Schedule",
    url: "/patient/schedule",
    icon: Calendar,
  },
  { 
    title: "Sessions",
    url: "/patient/sessions",
    icon: Armchair
  },
  { 
    title: "Journaling",
    url: "/patient/journal",
    icon: BookOpen
  },
  { 
    title: "Messages",
    url: "/patient/messages",
    icon: MessageSquare,
    badge: "3" // Could be made dynamic later
  }
]

const settingsNavItems: NavItem[] = [
  { 
    title: "Settings",
    url: "/patient/settings",
    icon: Settings
  },
  { 
    title: "Logout",
    url: "/logout",
    icon: LogOut,
    className: "text-red-600 hover:bg-red-50"
  }
]

export function PatientSidebar() {
  const pathname = usePathname()
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null)
  const [upcomingSession, setUpcomingSession] = React.useState<Session | null>(null)
  const [upcomingCount, setUpcomingCount] = React.useState<number>(0)

  // Listen for auth state changes to get the user's profile
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
            role: userData.role || "patient"
          })
        } else {
          setUserProfile(null)
        }

        // Fetch upcoming sessions count
        await fetchUpcomingSessions(user.uid, db)
      } else {
        setUserProfile(null)
        setUpcomingCount(0)
      }
    })
    return () => unsubscribe()
  }, [])

  // Fetch upcoming sessions and count
  const fetchUpcomingSessions = async (uid: string, db: any) => {
    try {
      const now = new Date()
      const sessionsRef = collection(db, "sessions")
      const q = query(
        sessionsRef,
        where("patientId", "==", uid),
        where("sessionDate", ">=", now)
      )
      const querySnapshot = await getDocs(q)
      
      // Set upcoming session (first one)
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0]
        const data = docSnap.data()
        
        const session: Session = {
          id: docSnap.id,
          sessionDate: data.sessionDate.toDate(),
          therapist: data.therapist || "",
          therapistId: data.therapistId || "",
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
          patientId: data.patientId || "",
          status: data.status || "",
          patientName: data.patientName || ""
        }
        
        // Fetch therapist name if not already available
        if (!session.therapist && session.therapistId) {
          const therapistRef = doc(db, "users", session.therapistId)
          const therapistSnap = await getDoc(therapistRef)
          if (therapistSnap.exists()) {
            const therapistData = therapistSnap.data()
            session.therapist = `Dr. ${therapistData.last_name || 'Unknown'}`
          }
        }
        
        setUpcomingSession(session)
      } else {
        setUpcomingSession(null)
      }

      // Set count of upcoming sessions
      setUpcomingCount(querySnapshot.size)
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error)
      setUpcomingCount(0)
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
    : ""

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
    if (path === "/patient" && pathname === "/patient") {
      return true;
    }
    // For other paths, check if the current path starts with the nav item path
    // But only if the nav item path is not just "/patient"
    return path !== "/patient" && pathname.startsWith(path);
  };

  // Update the Schedule nav item with dynamic badge
  const updatedMainNavItems = mainNavItems.map(item => {
    if (item.title === "Schedule") {
      return {
        ...item,
        badge: upcomingCount > 0 ? upcomingCount.toString() : undefined
      }
    }
    return item
  })

  return (
    <Sidebar className="flex flex-col h-screen">
      <SidebarHeader className="px-4 py-6 border-b">
        <Link href="/patient" className="flex items-center gap-3">
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
              <span className="text-sm font-medium">Upcoming Session</span>
            </div>
            <p className="mt-2 text-sm text-[#146C94]/70">
              {upcomingSession
                ? `${formatSessionDate(upcomingSession.sessionDate)} with ${upcomingSession.therapist || "Your Therapist"}`
                : "No upcoming sessions"}
            </p>
            {upcomingSession && (
              <Link 
                href={`/patient/sessions/${upcomingSession.id}`}
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
                  {userRole || "Patient"}
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
                    isActive={pathname === item.url}
                    className={`
                      w-full p-3 rounded-lg transition-colors duration-200
                      ${item.className || (pathname === item.url 
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