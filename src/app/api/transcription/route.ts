import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ensure transcriptions_saved directory exists
const transcriptDir = path.join(process.cwd(), 'public/transcriptions_saved');
if (!fs.existsSync(transcriptDir)) {
  fs.mkdirSync(transcriptDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const { roomName, text, timestamp, speaker, isNew } = await req.json();
    
    if (!roomName) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }
    
    // Format timestamp and create filename based on roomName
    const formattedDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const filename = `transcript_${roomName}_${formattedDate}.txt`;
    const filePath = path.join(transcriptDir, filename);
    
    // Format the transcript line with date and time
    const transcriptLine = text 
      ? `[${new Date(timestamp).toLocaleDateString()} ${new Date(timestamp).toLocaleTimeString()}] ${speaker}: ${text}\n`
      : '';
    
    // If isNew is true, we're starting a new transcription, so overwrite any existing file
    if (isNew) {
      fs.writeFileSync(filePath, `Transcript for room: ${roomName}\nDate: ${formattedDate}\n\n`);
      
      // If there's text, append it
      if (text) {
        fs.appendFileSync(filePath, transcriptLine);
      }
    } else if (text) {
      // Append to file if it exists, create if it doesn't
      fs.appendFileSync(filePath, transcriptLine);
    }
    
    return NextResponse.json({ 
      success: true, 
      filePath: `/transcriptions_saved/${filename}` 
    });
  } catch (error) {
    console.error('Error saving transcription:', error);
    return NextResponse.json({ 
      error: 'Failed to save transcription',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 