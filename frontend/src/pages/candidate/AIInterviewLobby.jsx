import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Mic, ShieldAlert, CheckCircle, AlertTriangle, Play } from 'lucide-react';
import { interviewsApi } from '../../api/interviews';

const AIInterviewLobby = () => {
  const navigate = useNavigate();
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    // Request permissions on mount
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setPermissionsGranted(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        setError("Camera and Microphone access are required to proceed. " + err.message);
      });

    return () => {
      // Cleanup streams when unmounting
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleStart = async () => {
    try {
      setIsStarting(true);
      setError(null);
      // Let's pass no job for a general skills interview, or you can extract job_id from URL
      const session = await interviewsApi.startInterview({});
      navigate(`/candidate/interviews/${session.id}/room`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start interview. The AI might be taking too long.");
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side - Video Preview */}
        <div className="w-full md:w-1/2 bg-black relative flex items-center justify-center min-h-[300px]">
          {permissionsGranted ? (
            <video 
              ref={videoRef} 
              autoPlay 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="text-slate-500 flex flex-col items-center">
              <Video className="w-12 h-12 mb-2 opacity-50" />
              <p>Awaiting Camera Permissions...</p>
            </div>
          )}
          
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md ${permissionsGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Video className="w-3 h-3" /> Camera {permissionsGranted ? 'Ready' : 'Off'}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md ${permissionsGranted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              <Mic className="w-3 h-3" /> Mic {permissionsGranted ? 'Ready' : 'Off'}
            </span>
          </div>
        </div>

        {/* Right Side - Instructions */}
        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-white mb-2">Technical AI Interview</h1>
          <p className="text-slate-400 mb-8">
            You are about to begin a 10-question adaptive technical interview conducted by Elite AI.
          </p>

          <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-4 mb-8">
            <h3 className="text-red-400 font-bold flex items-center gap-2 mb-2">
              <ShieldAlert className="w-5 h-5" />
              Strict Zero-Cheat Proctoring Enabled
            </h3>
            <ul className="space-y-2 text-sm text-red-300/80">
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                This test will lock your browser tab. If you switch tabs, open new windows, or click outside the screen, the test will instantly fail.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Your answers will be transcribed and graded on Technical Accuracy, Confidence (WPM), and Soft Skills.
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                Time Limit: You have exactly 15 minutes to complete the interview. If the timer runs out, the interview will automatically fail.
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!permissionsGranted || isStarting}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all
              bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white
              disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(16,185,129,0.3)]"
          >
            {isStarting ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Interview Now
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInterviewLobby;
