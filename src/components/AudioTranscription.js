import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const AudioTranscription = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'granted', 'denied'
  const [recognition, setRecognition] = useState(null);

  const checkMicrophonePermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' });
      setPermissionState(result.state);
      
      result.addEventListener('change', () => {
        setPermissionState(result.state);
        if (result.state === 'denied') {
          setIsListening(false);
          setError('Microphone access was denied. Please enable it in your browser settings.');
        }
      });
    } catch (err) {
      console.warn('Permission API not supported, falling back to getUserMedia');
    }
  };

  useEffect(() => {
    checkMicrophonePermission();

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
          setError('Microphone access denied. Please enable microphone access in your browser settings and refresh the page.');
          setPermissionState('denied');
        } else {
          setError(`Error occurred in recognition: ${event.error}`);
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

  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionState('granted');
      setError('');
      return true;
    } catch (err) {
      setError('Unable to access microphone. Please ensure you have a microphone connected and grant permission when prompted.');
      setPermissionState('denied');
      return false;
    }
  };

  const toggleListening = useCallback(async () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      if (permissionState === 'denied') {
        setError('Microphone access is blocked. Please enable it in your browser settings and refresh the page.');
        return;
      }

      if (permissionState === 'prompt') {
        const granted = await requestMicrophoneAccess();
        if (!granted) return;
      }

      setError('');
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        setError('Failed to start recording. Please refresh the page and try again.');
      }
    }
  }, [isListening, recognition, permissionState]);

  const getPermissionMessage = () => {
    switch (permissionState) {
      case 'denied':
        return (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Microphone Access Blocked</AlertTitle>
            <AlertDescription>
              Please enable microphone access in your browser settings and refresh the page:
              <ul className="list-disc ml-6 mt-2">
                <li>Click the camera/microphone icon in your browser's address bar</li>
                <li>Select "Allow" for microphone access</li>
                <li>Refresh the page</li>
              </ul>
            </AlertDescription>
          </Alert>
        );
      case 'prompt':
        return (
          <Alert className="mb-4">
            <AlertTitle>Microphone Permission Required</AlertTitle>
            <AlertDescription>
              Click the Start button to allow microphone access when prompted.
            </AlertDescription>
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Real-time Audio Transcription
          <Button 
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            className="w-32"
            disabled={!recognition}
          >
            {isListening ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getPermissionMessage()}
        
        {error && error !== 'Microphone access denied.' && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative min-h-40 p-4 rounded-md border bg-slate-50">
          {isListening && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
            </div>
          )}
          <p className="whitespace-pre-wrap">
            {transcript || 'Start speaking to see transcription here...'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AudioTranscription;