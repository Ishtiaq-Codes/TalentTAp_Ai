import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, AlertTriangle, CheckCircle, ShieldAlert, BrainCircuit, Loader2 } from 'lucide-react';
import { interviewsApi } from '../../api/interviews';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

const AIInterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cheatingFlags, setCheatingFlags] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [faceCount, setFaceCount] = useState(1);
  const [isCheating, setIsCheating] = useState(false);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [cheatTimeStr, setCheatTimeStr] = useState("0.0s / 30.0s");
  const cheatingFramesRef = useRef(0);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    interviewsApi.getInterview(id).then(data => {
      setSession(data);
      if (data.status === 'completed') {
        setShowResults(true);
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      navigate('/candidate/dashboard');
    });

    let active = true;

    // Start video preview and Vision AI
    const startVisionAI = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numFaces: 5,
          outputFacialTransformationMatrixes: true,
          outputFaceBlendshapes: true
        });
        
        faceDetectorRef.current = faceLandmarker;

        let lastVideoTime = -1;
        
        const detectFace = async () => {
          if (!active || !videoRef.current || !faceDetectorRef.current) return;
          
          if (videoRef.current.readyState >= 2 && videoRef.current.currentTime !== lastVideoTime) {
            lastVideoTime = videoRef.current.currentTime;
            try {
              const result = faceDetectorRef.current.detectForVideo(videoRef.current, performance.now());
              const count = result.faceLandmarks ? result.faceLandmarks.length : 0;
              setFaceCount(count);
              
              let isLookingAway = false;
              if (count === 1) {
                  // 1. Head Pose (Yaw & Pitch)
                  if (result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
                      const matrix = result.facialTransformationMatrixes[0].data;
                      const yaw = Math.atan2(matrix[8], Math.sqrt(matrix[9]*matrix[9] + matrix[10]*matrix[10])) * (180 / Math.PI);
                      const pitch = Math.atan2(-matrix[9], matrix[10]) * (180 / Math.PI); 
                      
                      if (Math.abs(yaw) > 25 || pitch < -20 || pitch > 25) { 
                          isLookingAway = true;
                      }
                  }

                  // 2. Eye Gaze Tracking (Blendshapes)
                  if (!isLookingAway && result.faceBlendshapes && result.faceBlendshapes.length > 0) {
                      const shapes = result.faceBlendshapes[0].categories;
                      const lookDown = shapes.find(s => s.categoryName === 'eyeLookDownLeft')?.score || 0;
                      const lookUp = shapes.find(s => s.categoryName === 'eyeLookUpLeft')?.score || 0;
                      const lookOut = shapes.find(s => s.categoryName === 'eyeLookOutLeft')?.score || 0;
                      const lookIn = shapes.find(s => s.categoryName === 'eyeLookInLeft')?.score || 0;
                      
                      // 0.35 will catch them looking at the edges of the screen instead of the camera
                      if (lookDown > 0.35 || lookUp > 0.35 || lookOut > 0.35 || lookIn > 0.35) {
                          isLookingAway = true;
                      }
                  }
              }
              
              if (isRecordingRef.current) {
                  if (count !== 1 || isLookingAway) {
                      setIsWarningActive(true);
                      cheatingFramesRef.current += 1;
                      // 60 frames at 2 FPS = 30 seconds total across ALL questions.
                      if (cheatingFramesRef.current >= 60) {
                          setIsCheating(true);
                          setIsRecording(false);
                          isRecordingRef.current = false;
                      }
                  } else {
                      setIsWarningActive(false);
                      // User requested no decay; time is strictly cumulative
                  }
                  setCheatTimeStr((cheatingFramesRef.current / 2).toFixed(1) + "s / 30.0s");
              }

            } catch (e) {
              console.error(e);
            }
          }
          
          setTimeout(() => {
            if (active) {
              animationFrameRef.current = requestAnimationFrame(detectFace);
            }
          }, 500);
        };
        detectFace();

      } catch (err) {
        console.error("Camera/Vision Error: ", err);
      }
    };
    startVisionAI();

    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted && !showResults) {
        setCheatingFlags(prev => prev + 1);
        interviewsApi.flagCheating(id, 'tab_switch');
        alert("WARNING: You left the interview tab. This has been flagged.");
      }
    };
    
    const handleBlur = () => {
      if (!isCompleted && !showResults) {
        setCheatingFlags(prev => prev + 1);
        interviewsApi.flagCheating(id, 'window_blur');
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

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
      active = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
      }
    };
  }, [id, navigate, isCompleted, showResults]);

  useEffect(() => {
    if (isCheating && !isCompleted) {
      interviewsApi.flagCheating(id, 'face_violation_auto_cancel').catch(e=>console.log(e));
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isCheating, id, isCompleted]);

  const startRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      setInterimTranscript('');
      startTimeRef.current = Date.now();
      // Notice: We NO LONGER reset cheatingFramesRef here! 
      // It accumulates across all 10 questions.
      try {
        recognitionRef.current.start();
      } catch(e) {}
      setIsRecording(true);
      isRecordingRef.current = true;
    } else {
      alert("Speech recognition is not supported in this browser. Please use Chrome.");
    }
  };

  const fullTranscriptText = (transcript + ' ' + interimTranscript).trim();
  const currentWordCount = fullTranscriptText.split(/\s+/).filter(word => word.length > 0).length;

  const stopRecordingAndSubmit = async () => {
    setIsRecording(false);
    isRecordingRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setSubmitting(true);
    
    const durationSeconds = Math.max(1, Math.floor((Date.now() - startTimeRef.current) / 1000));
    const wpm = Math.floor((currentWordCount / durationSeconds) * 60);

    const currentQuestion = session.questions[currentQuestionIndex];

    try {
      await interviewsApi.submitAnswer(id, currentQuestion.id, {
        transcript: fullTranscriptText,
        time_to_answer_seconds: durationSeconds,
        words_per_minute: wpm
      });

      if (currentQuestionIndex < session.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setTranscript('');
        setInterimTranscript('');
        setSubmitting(false);
      } else {
        setIsCompleted(true);
        await interviewsApi.completeInterview(id);
        const updatedSession = await interviewsApi.getInterview(id);
        setSession(updatedSession);
        setShowResults(true);
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer.");
      setSubmitting(false);
    }
  };

  if (isCheating) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <ShieldAlert className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4 text-red-500">Interview Cancelled</h1>
        <p className="text-slate-300 max-w-lg mb-8 text-lg">
          We detected severe rule violations (e.g., looking away from the screen, face obscured, or multiple people in frame). 
          Your interview has been automatically cancelled.
        </p>
        <button onClick={() => navigate('/candidate/dashboard')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-8 rounded-full transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <BrainCircuit className="w-12 h-12 text-blue-500 animate-pulse mb-4" />
        <h2 className="text-xl font-bold">AI is preparing your interview...</h2>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center p-8">
        <div className="max-w-4xl w-full bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl mt-12">
          <div className="flex flex-col items-center text-center">
            {session.passed ? (
              <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/50">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mb-6 border border-rose-500/50">
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              </div>
            )}
            <h1 className="text-3xl font-bold text-white mb-2">
              {session.passed ? 'Interview Passed!' : 'Interview Completed'}
            </h1>
            <p className="text-slate-400 max-w-xl mx-auto mb-8">
              {session.passed 
                ? "Congratulations! You've earned the AI Verified Expert badge on your profile. Recruiters will now see you as a top-tier candidate."
                : "Thank you for completing the interview. Your results have been saved, but you didn't quite reach the passing threshold this time."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center">
              <div className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Overall Score</div>
              <div className={`text-4xl font-extrabold ${session.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                {session.overall_score}%
              </div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center">
              <div className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Technical</div>
              <div className="text-3xl font-bold text-blue-400">{session.technical_score}%</div>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 text-center">
              <div className="text-slate-400 text-sm font-bold mb-2 uppercase tracking-wide">Soft Skills</div>
              <div className="text-3xl font-bold text-purple-400">{session.soft_skills_score}%</div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 mb-8">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-blue-400" /> AI Feedback Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">
              {session.ai_feedback_summary}
            </p>
          </div>

          <div className="flex justify-center">
            <button onClick={() => navigate('/candidate/dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = session.questions ? session.questions[currentQuestionIndex] : null;

  if (!currentQuestion && !showResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Interview Setup Error</h1>
        <p className="text-slate-400 max-w-lg mb-8">
          This interview session was interrupted during setup and has no questions generated. Please return to the dashboard and start a new interview.
        </p>
        <button onClick={() => navigate('/candidate/dashboard')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-2 rounded-xl">
            <BrainCircuit className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Gemini AI Interviewer</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-slate-400 font-medium">
            Question {currentQuestionIndex + 1} of {session.questions.length}
          </div>
          {cheatingFlags > 0 && (
            <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold border border-red-500/30">
              <ShieldAlert className="w-4 h-4" />
              Flags: {cheatingFlags}
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Question & Transcript */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-xl flex-grow flex flex-col">
            <div className="inline-block px-3 py-1 bg-slate-700/50 rounded-lg text-slate-300 text-sm font-bold w-max mb-4 uppercase tracking-wider">
              {currentQuestion.question_type.replace('_', ' ')}
            </div>
            <h2 className="text-3xl font-bold text-white leading-tight mb-8">
              "{currentQuestion.question_text}"
            </h2>
            
            <div className="flex-grow flex flex-col justify-end">
              <div className="w-full min-h-[150px] bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50 relative">
                {!isRecording && !transcript && !interimTranscript && (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500 italic">
                    Click "Start Answering" to begin speaking...
                  </div>
                )}
                <p className="text-slate-300 text-lg leading-relaxed">
                  {transcript}
                  <span className="text-slate-500">{interimTranscript}</span>
                  {isRecording && <span className="inline-block w-2 h-5 bg-emerald-500 animate-pulse ml-1 align-middle"></span>}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Camera & Controls */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-slate-800 rounded-3xl p-4 border border-slate-700 shadow-xl relative overflow-hidden aspect-video lg:aspect-auto lg:flex-grow">
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover rounded-2xl"
            />
            {isRecording && (
              <div className="absolute top-8 right-8 flex flex-col items-end gap-2 z-30">
                <div className="flex items-center gap-2 bg-red-500/20 backdrop-blur-md text-red-100 px-3 py-1 rounded-full text-sm font-bold border border-red-500/50">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  REC
                </div>
                {/* Debug Cheat Timer: Uncomment this block to see real-time cheat limits while testing */}
                {/* <div className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md text-orange-100 px-3 py-1 rounded-full text-xs font-mono font-bold border border-orange-500/50">
                  Cheat Time: {cheatTimeStr}
                </div> */}
              </div>
            )}
            
            {/* Face Detection Overlays */}
            {isWarningActive && faceCount === 1 && !showResults && !isCompleted && (
              <div className="absolute inset-0 bg-orange-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl border-4 border-orange-500 animate-pulse">
                <ShieldAlert className="w-16 h-16 text-white mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Looking Away Detected</h3>
                <p className="text-orange-100">Please look directly at the camera. The interview will be cancelled if you continue to look away.</p>
              </div>
            )}
            {faceCount === 0 && !showResults && !isCompleted && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl border-4 border-red-500 animate-pulse">
                <AlertTriangle className="w-16 h-16 text-white mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Face Not Detected</h3>
                <p className="text-red-100">Please ensure you are in a well-lit room and facing the camera directly. The interview will not proceed.</p>
              </div>
            )}
            {faceCount > 1 && !showResults && !isCompleted && (
              <div className="absolute inset-0 bg-red-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl border-4 border-red-500">
                <ShieldAlert className="w-16 h-16 text-white mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Multiple Faces Detected</h3>
                <p className="text-red-100">Only one person is permitted in the frame during the interview. This has been flagged.</p>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-3xl p-6 border border-slate-700 shadow-xl">
            {submitting ? (
              <button disabled className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 bg-slate-700 text-slate-300">
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Answer...
              </button>
            ) : !isRecording ? (
              <button
                onClick={startRecording}
                disabled={faceCount !== 1}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${faceCount !== 1 ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}
              >
                <Mic className="w-5 h-5" />
                {faceCount === 0 ? 'Face not detected' : faceCount > 1 ? 'Multiple faces' : 'Start Answering'}
              </button>
            ) : (
              <button
                onClick={stopRecordingAndSubmit}
                disabled={currentWordCount < 3}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${currentWordCount < 3 ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)]'}`}
              >
                <CheckCircle className="w-5 h-5" />
                Submit Answer
              </button>
            )}
            
            <p className="text-center text-slate-500 text-sm mt-4">
              {currentWordCount < 3 && isRecording ? (
                <span className="text-amber-400 font-bold flex items-center justify-center gap-1"><AlertTriangle className="w-4 h-4" /> Please provide a longer answer.</span>
              ) : (
                "Speak clearly. The AI is transcribing your response."
              )}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIInterviewRoom;
