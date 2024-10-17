import { useState, useEffect, useCallback } from 'react';

const SimpleAudioTranscription = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (window.SpeechRecognition || window.webkitSpeechRecognition) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript((prev) => finalTranscript + interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        if (event.error === 'not-allowed') {
          setError('Please enable microphone access in your browser settings and refresh the page.');
        } else {
          setError(`Error: ${event.error}`);
        }
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech recognition is not supported in this browser.');
    }

    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setError('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError('Failed to start recording. Please refresh and try again.');
      }
    }
  }, [isListening, recognition]);

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: 'white'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0 }}>Audio Transcription</h2>
        <button
          onClick={toggleListening}
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: isListening ? '#ff4444' : '#4CAF50',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          {isListening ? 'Stop' : 'Start'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '10px',
          marginBottom: '20px',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          color: '#c62828'
        }}>
          {error}
        </div>
      )}

      <div style={{
        position: 'relative',
        minHeight: '150px',
        padding: '16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
        color: '#888',
        border: '1px solid #ddd'
      }}>
        {isListening && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#ff4444',
            animation: 'pulse 1s infinite'
          }} />
        )}
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
          {transcript || 'Start speaking to see transcription here...'}
        </p>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default SimpleAudioTranscription;