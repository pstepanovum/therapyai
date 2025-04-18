import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import fs from "fs";
import path from "path";
import { OpenAI } from "openai";
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
const getFirebaseAdmin = () => {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  return {
    auth: admin.auth(),
    db: admin.firestore(),
  };
};

// Define interfaces for request and response types
interface TranscriptionRequest {
  s3Key: string;
  sessionDate: string;
  therapistId: string;
  userId: string;
  sessionId: string;
}

interface SummaryResponse {
  data: string;
}

interface SummaryData {
  summary: string;
  shortSummary: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
  journalingPrompt: string;
}

// Use Record<string, any> to make it compatible with Firestore
interface SessionData extends Record<string, unknown> {
  sessionDate: Date;
  therapistId: string;
  patientId: string;
  summary: string;
  shortSummary: string;
  keyPoints: string[];
  insights: string[];
  mood: string;
  progress: string;
  goals: string[];
  warnings: string[];
  transcript: string;
  journalingPrompt: string;
  journalingResponse: string;
  status: string;
}

const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY_ID!,
  secretAccessKey: process.env.S3_KEY_SECRET!,
  region: process.env.S3_REGION!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  let filePath: string | undefined;

  try {
    // Parse and validate request body
    let body: TranscriptionRequest;
    try {
      body = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      // Using underscore to indicate intentionally unused parameter
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { s3Key, sessionDate, therapistId, userId, sessionId } = body;

    if (!s3Key || !sessionDate || !therapistId || !userId || !sessionId) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    console.log('🥳');
    const { db } = getFirebaseAdmin();

    // Download MP4 file from S3
    console.log('🥳');
    const bucketName = process.env.S3_BUCKET!;
    if (!bucketName) {
      throw new Error("S3_BUCKET environment variable not set");
    }

    const objectKey = s3Key.replace(/^s3:\/\/[^/]+\//, "");
    filePath = `/tmp/${path.basename(objectKey)}`;
    const fileStream = fs.createWriteStream(filePath);

    try {
      const s3Stream = s3.getObject({ Bucket: bucketName, Key: objectKey }).createReadStream();
      await new Promise<void>((resolve, reject) => {
        s3Stream.pipe(fileStream);
        s3Stream.on("end", () => resolve());
        s3Stream.on("error", reject);
      });
    } catch (s3Error) {
      throw new Error(`Failed to download file from S3: ${s3Error instanceof Error ? s3Error.message : String(s3Error)}`);
    }

    // Transcribe with OpenAI Whisper
    console.log('🥳');
    let transcription;
    try {
      // Use FileReadStream with proper typings
      const fileReadStream = fs.createReadStream(filePath);
      
      transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: fileReadStream,
        response_format: "json",
      });
    } catch (transcriptionError) {
      throw new Error(`Transcription failed: ${transcriptionError instanceof Error ? transcriptionError.message : String(transcriptionError)}`);
    } finally {
      // Cleanup file even if transcription fails
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.log('Transcription:', transcription.text);

    // Fetch summary
    console.log('🥳');
    let summaryText: SummaryData;
    try {
      const summaryResponse = await fetch("http://localhost:3000/api/getSummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: transcription.text }),
      });

      if (!summaryResponse.ok) {
        throw new Error(`Summary API returned ${summaryResponse.status}: ${await summaryResponse.text()}`);
      }

      const summaryJson: SummaryResponse = await summaryResponse.json();
      if (!summaryJson.data) {
        throw new Error("Summary API response missing 'data' field");
      }

      summaryText = JSON.parse(summaryJson.data);
    } catch (summaryError) {
      throw new Error(`Failed to get summary: ${summaryError instanceof Error ? summaryError.message : String(summaryError)}`);
    }

    console.log('🥳🥳🥳🥳', summaryText);

    // Prepare session data
    console.log('🥳');
    const newSessionDate = new Date(sessionDate);
    if (isNaN(newSessionDate.getTime())) {
      throw new Error("Invalid sessionDate format");
    }

    const newSession: SessionData = {
      sessionDate: newSessionDate,
      therapistId,
      patientId: userId,
      summary: summaryText.summary || "No summary provided",
      shortSummary: summaryText.shortSummary || "",
      keyPoints: summaryText.keyPoints || [],
      insights: summaryText.insights || [],
      mood: summaryText.mood || "Neutral",
      progress: summaryText.progress || "Stable",
      goals: summaryText.goals || [],
      warnings: summaryText.warnings || [],
      transcript: transcription.text,
      journalingPrompt: summaryText.journalingPrompt || "",
      journalingResponse: "",
      status: "Scheduled",
    };
    console.log(summaryText.summary);
    console.log(newSession);

    // Update Firestore
    console.log('🥳');
    try {
      const docRef = db.collection('sessions').doc(sessionId);
      await docRef.update(newSession);
    } catch (firestoreError) {
      throw new Error(`Failed to update Firestore: ${firestoreError instanceof Error ? firestoreError.message : String(firestoreError)}`);
    }

    console.log('Session updated successfully:', newSession);

    return NextResponse.json({ transcription, summaryText }, { status: 200 });
  } catch (error) {
    // Enhanced error logging
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in POST /api/getTranscription:", {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: errorMessage || "Failed to process file" },
      { status: 500 }
    );
  }
}