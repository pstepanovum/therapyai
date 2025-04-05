import { NextRequest, NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getFirestore, doc, updateDoc, DocumentData } from "firebase/firestore";

// Define the full session document structure
interface SessionDocument {
  sessionDate?: Date;
  therapistId?: string;
  patientId?: string;
  summary?: string;
  keyPoints?: string[];
  insights?: string[];
  mood?: string;
  progress?: string;
  goals?: string[];
  warnings?: string[];
  transcript?: string;
  journalingPrompt?: string;
  journalingResponse?: string;
  status?: string;
}

// Use Partial for updates
type SessionUpdate = Partial<SessionDocument>;

// Interface for request body
interface UpdateSessionRequest {
  sessionDate?: string;
  therapistId?: string;
  patientId?: string;
  summary?: string;
  keyPoints?: string[];
  insights?: string[];
  mood?: string;
  progress?: string;
  goals?: string[];
  warnings?: string[];
  transcript?: string;
  journalingPrompt?: string;
  journalingResponse?: string;
  status?: string;
}

// Initialize Firestore
const db = getFirestore();

// Define the params type for the dynamic route
interface RouteParams {
  params: {
    sessionId: string;
  };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    const requestData: UpdateSessionRequest = await req.json();
    const {
      sessionDate,
      therapistId,
      patientId,
      summary,
      keyPoints,
      insights,
      mood,
      progress,
      goals,
      warnings,
      transcript,
      journalingPrompt,
      journalingResponse,
      status,
    } = requestData;

    const updatedSession: SessionUpdate = {};

    if (sessionDate) {
      const date = new Date(sessionDate);
      updatedSession.sessionDate = date;
    }
    if (therapistId) updatedSession.therapistId = therapistId;
    if (patientId) updatedSession.patientId = patientId;
    if (summary) updatedSession.summary = summary;
    if (keyPoints) updatedSession.keyPoints = keyPoints;
    if (insights) updatedSession.insights = insights;
    if (mood) updatedSession.mood = mood;
    if (progress) updatedSession.progress = progress;
    if (goals) updatedSession.goals = goals;
    if (warnings) updatedSession.warnings = warnings;
    if (transcript) updatedSession.transcript = transcript;
    if (journalingPrompt !== undefined) updatedSession.journalingPrompt = journalingPrompt;
    if (journalingResponse !== undefined) updatedSession.journalingResponse = journalingResponse;
    if (status) updatedSession.status = status;

    if (Object.keys(updatedSession).length === 0) {
      return NextResponse.json({ error: "No fields provided to update" }, { status: 400 });
    }

    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, updatedSession);

    console.log(`Session ${sessionId} updated successfully:`, updatedSession);

    return NextResponse.json({ message: "Session updated successfully", updatedSession }, { status: 200 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}