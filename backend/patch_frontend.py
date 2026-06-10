import os
import re

path = r'C:\Users\user\OneDrive\Desktop\FYP(SaaS)\frontend\src\pages\candidate\AIInterviewRoom.jsx'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update imports
content = content.replace('FaceDetector, FilesetResolver', 'FaceLandmarker, FilesetResolver')

# 2. Add cheatingFramesRef and isCheating states
state_injection = """
  const [faceCount, setFaceCount] = useState(1);
  const [isCheating, setIsCheating] = useState(false);
  const cheatingFramesRef = useRef(0);
"""
content = re.sub(r'const \[faceCount, setFaceCount\] = useState\(1\);', state_injection.strip(), content)

# 3. Replace startVisionAI implementation
vision_code = """
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
          outputFacialTransformationMatrixes: true
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
              if (count === 1 && result.facialTransformationMatrixes && result.facialTransformationMatrixes.length > 0) {
                  const matrix = result.facialTransformationMatrixes[0].data;
                  // Calculate yaw
                  const yaw = Math.atan2(matrix[8], Math.sqrt(matrix[9]*matrix[9] + matrix[10]*matrix[10])) * (180 / Math.PI);
                  if (Math.abs(yaw) > 25) { // 25 degrees tolerance
                      isLookingAway = true;
                  }
              }
              
              if (isRecordingRef.current) {
                  if (count !== 1 || isLookingAway) {
                      cheatingFramesRef.current += 1;
                      // 10 frames = ~5 seconds at 2 FPS
                      if (cheatingFramesRef.current >= 8) {
                          setIsCheating(true);
                          setIsRecording(false);
                          isRecordingRef.current = false;
                      }
                  } else {
                      cheatingFramesRef.current = Math.max(0, cheatingFramesRef.current - 1);
                  }
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
"""

start_marker = 'const vision = await FilesetResolver.forVisionTasks('
end_marker = 'detectFace();'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + vision_code.strip() + content[end_idx:]

# 4. Handle isCheating in effects (auto cancel)
effect_hook = """
  useEffect(() => {
    if (isCheating && !isCompleted) {
      interviewsApi.flagCheating(id, 'face_violation_auto_cancel').catch(e=>console.log(e));
      if (recognitionRef.current) recognitionRef.current.stop();
    }
  }, [isCheating, id, isCompleted]);
"""
content = content.replace('const startRecording = () => {', effect_hook.strip() + '\n\n  const startRecording = () => {')


# 5. Add isCheating render logic at the top of rendering section
render_cheat = """
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
"""
content = content.replace('if (loading || !session) {', render_cheat.strip() + '\n\n  if (loading || !session) {')

# 6. Disable start button if faceCount != 1
old_btn = """
                onClick={startRecording}
                className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              >
                <Mic className="w-5 h-5" />
                Start Answering
              </button>
"""
new_btn = """
                onClick={startRecording}
                disabled={faceCount !== 1}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${faceCount !== 1 ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]'}`}
              >
                <Mic className="w-5 h-5" />
                {faceCount === 0 ? 'Face not detected' : faceCount > 1 ? 'Multiple faces' : 'Start Answering'}
              </button>
"""
content = content.replace(old_btn.strip(), new_btn.strip())

# 7. Also add "Looking away" warning in video box
look_away_warning = """
            {isRecording && faceCount === 1 && cheatingFramesRef.current > 3 && !showResults && !isCompleted && (
              <div className="absolute inset-0 bg-orange-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 rounded-2xl border-4 border-orange-500 animate-pulse">
                <ShieldAlert className="w-16 h-16 text-white mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Looking Away Detected</h3>
                <p className="text-orange-100">Please look directly at the camera. The interview will be cancelled if you continue to look away.</p>
              </div>
            )}
"""
content = content.replace('{/* Face Detection Overlays */}', '{/* Face Detection Overlays */}' + '\n' + look_away_warning.strip())

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched successfully")
