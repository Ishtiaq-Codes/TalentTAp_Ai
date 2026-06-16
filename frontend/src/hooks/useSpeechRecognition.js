import { useState, useRef, useEffect, useCallback } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export function useSpeechRecognition({ onStopRecording }) {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTxt = '';
        let interimTxt = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTxt += event.results[i][0].transcript + ' ';
          } else {
            interimTxt += event.results[i][0].transcript;
          }
        }
        if (finalTxt) setTranscript(prev => prev + finalTxt);
        setInterimTranscript(interimTxt);
      };
      
      recognition.onend = () => {
        if (isRecordingRef.current) {
          try { recognition.start(); } catch(e){}
        }
      };

      recognition.onerror = (event) => {
        if (event.error === 'not-allowed') {
          alert("Microphone access was denied. Please allow microphone permissions in your browser.");
          setIsRecording(false);
          isRecordingRef.current = false;
        } else if (event.error !== 'no-speech') {
          console.error("Speech recognition error:", event.error);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      startTimeRef.current = Date.now();
      try {
        recognitionRef.current.start();
      } catch(e) {}
      setIsRecording(true);
      isRecordingRef.current = true;
    } else {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
    }
    const durationSeconds = Math.max(1, Math.floor((Date.now() - (startTimeRef.current || Date.now())) / 1000));
    
    return durationSeconds;
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  return {
    transcript,
    interimTranscript,
    isRecording,
    isRecordingRef,
    startRecording,
    stopRecording,
    resetTranscript,
    fullTranscriptText: (transcript + ' ' + interimTranscript).trim()
  };
}
