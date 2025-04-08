import React, { useState, useEffect, useRef } from 'react';
import { Room, LocalParticipant, Participant, RemoteParticipant } from 'livekit-client';
import { Button } from '@/components/ui/button';

interface LivekitTranscriptionProps {
  room: Room | null;
  roomName: string;
  className?: string;
  onTranscriptDownload?: (filename: string) => void;
}

const LivekitTranscription: React.FC<LivekitTranscriptionProps> = ({
  room,
  roomName,
  className,
  onTranscriptDownload
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [currentFilename, setCurrentFilename] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const localParticipantRef = useRef<LocalParticipant | null>(null);
  const formattedDate = useRef<string>(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
  const activeParticipantsRef = useRef<Map<string, Participant>>(new Map());

  // Initialize transcription and track participants
  useEffect(() => {
    if (!room) return;

    // Store local participant
    if (room.localParticipant) {
      localParticipantRef.current = room.localParticipant;
      activeParticipantsRef.current.set(room.localParticipant.identity, room.localParticipant);
    }

    // Track all remote participants
    const remoteParticipants = Array.from(room.remoteParticipants.values());
    remoteParticipants.forEach((participant: RemoteParticipant) => {
      activeParticipantsRef.current.set(participant.identity, participant);
    });

    // Set up listeners for when participants join and leave
    const onParticipantConnected = (participant: RemoteParticipant) => {
      activeParticipantsRef.current.set(participant.identity, participant);
      console.log(`Participant connected: ${participant.identity}`);
    };

    const onParticipantDisconnected = (participant: RemoteParticipant) => {
      activeParticipantsRef.current.delete(participant.identity);
      console.log(`Participant disconnected: ${participant.identity}`);
    };

    room.on('participantConnected', onParticipantConnected);
    room.on('participantDisconnected', onParticipantDisconnected);

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping recognition
        }
      }
      
      // Remove event listeners
      room.off('participantConnected', onParticipantConnected);
      room.off('participantDisconnected', onParticipantDisconnected);
    };
  }, [room]);

  // Function to save transcript to file on server
  const saveTranscriptToFile = async (
    text: string,
    speaker: string,
    isNew = false
  ) => {
    try {
      const timestamp = new Date().toISOString();
      
      const response = await fetch('/api/transcription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName,
          text,
          timestamp,
          speaker,
          isNew
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        console.error('Error saving transcript:', data.error);
      } else if (isNew) {
        // Set current filename only when starting a new transcript
        setCurrentFilename(`transcript_${roomName}_${formattedDate.current}.txt`);
      }
      
    } catch (e) {
      console.error('Error calling transcription API:', e);
    }
  };

  // Try to detect which participant is speaking
  const detectActiveSpeaker = (): string => {
    if (!room) return 'Unknown';
    
    // Check if we have an active speaker
    const activeSpeakers = room.activeSpeakers;
    if (activeSpeakers && activeSpeakers.length > 0) {
      // Return the first active speaker's identity
      return activeSpeakers[0].identity;
    }
    
    // If no active speaker is detected, fall back to the local participant
    return room.localParticipant.identity;
  };

  const setupSpeechRecognition = () => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      if (!room) return;
      
      // Try to identify the speaker
      const speakerId = detectActiveSpeaker();
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        
        // Add to server file when we have a final result
        if (isFinal && transcript.trim()) {
          saveTranscriptToFile(transcript, speakerId);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setStatus(`Error: ${event.error}`);
      }
    };

    return recognition;
  };

  const startTranscription = async () => {
    if (isRecording || !room) return;
    
    setStatus('Starting...');
    formattedDate.current = new Date().toISOString().split('T')[0];
    
    // Initialize a new transcript file on the server
    await saveTranscriptToFile('', room.localParticipant.identity, true);
    
    // Start speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = setupSpeechRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
        console.log('Speech recognition started');
        setStatus('Recording...');
      }
    } else {
      console.warn('Speech recognition not available');
      setStatus('Error: Speech recognition not supported in this browser');
    }
    
    setIsRecording(true);
  };

  const stopTranscription = () => {
    if (!isRecording) return;
    
    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      recognitionRef.current = null;
    }
    
    setStatus('Stopped');
    setIsRecording(false);
  };

  const downloadTranscript = () => {
    if (!currentFilename) {
      console.warn('No transcript available to download');
      return;
    }
    
    // Open the transcript file in a new tab
    window.open(`/transcriptions_saved/${currentFilename}`, '_blank');
    
    if (onTranscriptDownload) {
      onTranscriptDownload(currentFilename);
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Status: {status}</div>
          <div className="flex gap-2">
            <Button 
              onClick={startTranscription} 
              disabled={isRecording || !room}
              data-testid="start-transcription-btn"
              variant="outline" 
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              Start Transcription
            </Button>
            <Button 
              onClick={stopTranscription} 
              disabled={!isRecording}
              data-testid="stop-transcription-btn"
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              Stop
            </Button>
            <Button 
              onClick={downloadTranscript} 
              disabled={!currentFilename}
              data-testid="download-transcript-btn"
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              View Transcript
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivekitTranscription;

// Add TypeScript typings for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
} 