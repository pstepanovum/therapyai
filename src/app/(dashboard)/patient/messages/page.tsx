/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { auth } from "@/app/utils/firebase/config"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"
import MessagePage from "../../shared/componenets/message/MessageComponenet"

export default function PatientMessagesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/signin");
        return;
      }
      const displayName = user.displayName || user.email?.split("@")[0] || "User";
      setUserName(displayName.charAt(0).toUpperCase() + displayName.slice(1));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="p-6 max-w-6xl mx-auto">Loading dashboard...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#146C94]">Messages</h1>
        <p className="text-gray-600 mt-2">Connect with your care team</p>
      </div>
      {auth.currentUser && (
        <MessagePage
          userId={auth.currentUser.uid}
          userType="patient"
          onError={(error) => console.error("Message error:", error)}
        />
      )}
    </div>
  );
}