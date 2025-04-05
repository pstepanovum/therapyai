import { useIsRecording } from '@livekit/components-react';
import * as React from 'react';

export function RecordingIndicator() {
  const isRecording = useIsRecording();
  const [wasRecording, setWasRecording] = React.useState(false);
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    if (isRecording !== wasRecording) {
      setWasRecording(isRecording);
      if (isRecording) {
        // Show a less intrusive banner instead of an alert
        setShowBanner(true);
        
        // Hide banner after 5 seconds
        const timer = setTimeout(() => {
          setShowBanner(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isRecording, wasRecording]);

  return (
    <>
      {/* Recording border indicator */}
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          boxShadow: isRecording ? 'rgba(255, 0, 0, 0.5) 0px 0px 0px 4px inset' : 'none',
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 10,
          transition: 'box-shadow 0.3s ease',
        }}
      />
      
      {/* Recording indicator pill */}
      {isRecording && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 0, 0, 0.85)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            zIndex: 20,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'white',
              marginRight: '6px',
              animation: 'pulse 1.5s infinite',
            }}
          />
          REC
        </div>
      )}
      
      {/* Notification banner */}
      {showBanner && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 0, 0, 0.85)',
            color: 'white',
            fontSize: '14px',
            padding: '8px 16px',
            borderRadius: '8px',
            zIndex: 30,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: 'slideDown 0.3s ease',
            whiteSpace: 'nowrap',
          }}
        >
          This meeting is being recorded
        </div>
      )}
      
      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}