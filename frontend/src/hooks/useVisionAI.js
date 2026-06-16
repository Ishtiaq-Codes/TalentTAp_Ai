import { useState, useEffect, useRef, useCallback } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export function useVisionAI({ isRecordingRef, enabled }) {
  const [faceCount, setFaceCount] = useState(1);
  const [isWarningActive, setIsWarningActive] = useState(false);
  const [isCheating, setIsCheating] = useState(false);
  const [cheatTimeStr, setCheatTimeStr] = useState("0.0s / 30.0s");

  const videoRef = useRef(null);
  const faceDetectorRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cheatingFramesRef = useRef(0);
  const activeRef = useRef(true);

  useEffect(() => {
    if (!enabled) return;

    activeRef.current = true;

    const startVisionAI = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!activeRef.current) {
           stream.getTracks().forEach(track => track.stop());
           return;
        }
        mediaStreamRef.current = stream;
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
          if (!activeRef.current || !videoRef.current || !faceDetectorRef.current) return;
          
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
                      
                      if (lookDown > 0.35 || lookUp > 0.35 || lookOut > 0.35 || lookIn > 0.35) {
                          isLookingAway = true;
                      }
                  }
              }
              
              // Only accumulate cheating frames if we are actively recording
              if (isRecordingRef.current) {
                  if (count !== 1 || isLookingAway) {
                      setIsWarningActive(true);
                      cheatingFramesRef.current += 1;
                      // 60 frames at ~2 FPS = 30 seconds total across ALL questions.
                      if (cheatingFramesRef.current >= 60) {
                          setIsCheating(true);
                      }
                  } else {
                      setIsWarningActive(false);
                  }
                  setCheatTimeStr((cheatingFramesRef.current / 2).toFixed(1) + "s / 30.0s");
              }

            } catch (e) {
              console.error(e);
            }
          }
          
          setTimeout(() => {
            if (activeRef.current) {
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

    return () => {
      activeRef.current = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject = null;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (faceDetectorRef.current) {
        faceDetectorRef.current.close();
      }
    };
  }, [enabled]);

  const forceStopVision = useCallback(() => {
    activeRef.current = false;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject = null;
    }
  }, []);

  return {
    videoRef,
    faceCount,
    isWarningActive,
    isCheating,
    setIsCheating,
    cheatTimeStr,
    forceStopVision
  };
}
