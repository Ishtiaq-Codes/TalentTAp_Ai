import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, AlertTriangle, CheckCircle, ShieldAlert, BrainCircuit, Loader2, Clock } from 'lucide-react';
import { interviewsApi } from '../../api/interviews';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useVisionAI } from '../../hooks/useVisionAI';

const AIInterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cheatingFlags, setCheatingFlags] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [instructionsRead, setInstructionsRead] = useState(false);
  const instructionsReadRef = useRef(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [isTimeout, setIsTimeout] = useState(false);

  // Custom Hooks for Hardware
  const {
    transcript,
    interimTranscript,
    isRecording,
    isRecordingRef,
    startRecording,
    stopRecording,
    resetTranscript,
    fullTranscriptText
  } = useSpeechRecognition({
    onStopRecording: () => {}
  });

  const {
    videoRef,
    faceCount,
    isWarningActive,
    isCheating,
    setIsCheating,
    cheatTimeStr,
    forceStopVision
  } = useVisionAI({ 
    isRecordingRef, 
    enabled: !loading && !isTimeout && !showResults 
  });

  const currentWordCount = fullTranscriptText.split(/\s+/).filter(word => word.length > 0).length;

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

    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted && !showResults && instructionsReadRef.current) {
        interviewsApi.flagCheating(id, 'tab_switch');
        setIsCheating(true);
        if (isRecordingRef.current) {
            stopRecording();
        }
      }
    };
    
    const handleBlur = () => {
      if (!isCompleted && !showResults && instructionsReadRef.current) {
        interviewsApi.flagCheating(id, 'window_blur');
        setIsCheating(true);
        if (isRecordingRef.current) {
            stopRecording();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [id, navigate, isCompleted, showResults, isRecordingRef, stopRecording, setIsCheating]);

  useEffect(() => {
    if (isCheating && !isCompleted) {
      interviewsApi.flagCheating(id, 'face_violation_auto_cancel').catch(e=>console.log(e));
    }
    
    // Always kill camera when cheating is detected or results are shown
    if (isCheating || showResults) {
      forceStopVision();
      if (isRecordingRef.current) {
        stopRecording();
      }
    }
  }, [isCheating, id, isCompleted, showResults, forceStopVision, stopRecording, isRecordingRef]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  useEffect(() => {
    let timer;
    if (instructionsRead && !isCompleted && !showResults && !isCheating && !isTimeout && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [instructionsRead, isCompleted, showResults, isCheating, isTimeout, timeLeft, id]);

  const handleTimeout = async () => {
    try {
      await interviewsApi.flagCheating(id, 'timeout_auto_cancel');
      await interviewsApi.completeInterview(id).catch(e => console.log(e));
      setIsTimeout(true);
      if (isRecordingRef.current) {
        stopRecording();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const stopRecordingAndSubmit = async () => {
    const durationSeconds = stopRecording();
    setSubmitting(true);
    
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
        resetTranscript();
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-8 text-center text-white">
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

  if (isTimeout) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-8 text-center text-white">
        <AlertTriangle className="w-24 h-24 text-orange-500 mb-6 animate-pulse" />
        <h1 className="text-4xl font-bold mb-4 text-orange-500">Time's Up!</h1>
        <p className="text-slate-300 max-w-lg mb-8 text-lg">
          You did not complete the interview within the allocated 15 minutes. The interview has been automatically terminated and marked as failed.
        </p>
        <button onClick={() => navigate('/candidate/dashboard')} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-8 rounded-full transition-all">
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
        <p className="text-xl font-bold">Setting up interview room...</p>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center p-6 sm:p-8">
        <div className="max-w-4xl w-full bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl mt-12">
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-8 text-center text-white">
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
        
        {!instructionsRead && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 font-sans">
            <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
                  <ShieldAlert className="w-6 h-6 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-white">Strict Interview Rules</h1>
              </div>
              
              <div className="space-y-4 mb-8 text-slate-300">
                <p className="text-lg">Please read these rules carefully. Violating them will result in <strong>immediate termination</strong> of your interview.</p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="text-red-400 mt-1">•</span>
                    <span><strong>No Tab Switching:</strong> If you minimize the window, click outside the interview, or switch tabs even once, the interview will instantly fail.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-orange-400 mt-1">•</span>
                    <span><strong>Camera Focus:</strong> You must look directly at the camera. Looking away or down for a cumulative 30 seconds will terminate the session.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-amber-400 mt-1">•</span>
                    <span><strong>Face Detection:</strong> Only one face is allowed in the frame. If your face is obscured or multiple faces appear, it will be flagged.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span><strong>Time Limit:</strong> You have exactly 15 minutes to complete the interview. If the timer runs out, you will fail automatically.</span>
                  </li>
                </ul>
              </div>
              
              <button 
                onClick={() => {
                  setInstructionsRead(true);
                  instructionsReadRef.current = true;
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(5,150,105,0.2)]"
              >
                I Understand, Start Interview
              </button>
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="w-full max-w-6xl flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-xl">
              <BrainCircuit className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">Elite Interviewer</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold border ${timeLeft < 180 ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
              <Clock className="w-4 h-4" />
              {formatTime(timeLeft)}
            </div>
            <div className="text-slate-400 font-medium">
              Question {currentQuestionIndex + 1} of {session.questions?.length || 0}
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
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl flex-grow flex flex-col">
              <div className="inline-block px-3 py-1 bg-slate-700/50 rounded-lg text-slate-300 text-sm font-bold w-max mb-4 uppercase tracking-wider">
                {currentQuestion.question_type?.replace(/_/g, ' ') || 'QUESTION'}
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
