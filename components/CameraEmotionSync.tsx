import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Aperture, Loader2, Zap, ZapOff, Activity } from 'lucide-react';
import { localEmotionBridge } from '../services/LocalEmotionBridge';
import { Emotion } from '../types';

interface CameraEmotionSyncProps {
  onEmotionDetected: (emotion: Emotion) => void;
  onClose: () => void;
}

export const CameraEmotionSync: React.FC<CameraEmotionSyncProps> = ({ onEmotionDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(true);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please allow permissions.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Listen to Local Bridge
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    if (autoMode) {
      unsubscribe = localEmotionBridge.subscribe((data) => {
        setDetected(data.emotion);
        onEmotionDetected(data.emotion);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [autoMode, onEmotionDetected]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = 300; // Resize for performance
    canvas.height = 300 * (videoRef.current.videoHeight / videoRef.current.videoWidth);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Flip horizontally to match mirrored video
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      // Get Base64 (remove prefix)
      const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
      localEmotionBridge.sendFrame(base64);
    }
  }, []);

  const handleCapture = useCallback(async () => {
    captureFrame();

    // Simple visual feedback
    setIsAnalyzing(true);
    setTimeout(() => setIsAnalyzing(false), 500);
  }, [captureFrame]);

  // Auto-Capture Loop
  useEffect(() => {
    let interval: any;
    if (autoMode) {
      interval = setInterval(() => {
        captureFrame();
      }, 500); // Send frame every 500ms
    }
    return () => clearInterval(interval);
  }, [autoMode, captureFrame]);

  return (
    <div className="fixed bottom-24 left-24 z-[150] w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in">
      <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${autoMode ? 'bg-green-500 animate-pulse' : 'bg-red-500'} transition-colors`} />
          <span className="text-xs font-bold text-white tracking-wider">
            {autoMode ? 'LIVE SYNC' : 'CAMERA FEED'}
          </span>
        </div>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="relative aspect-video bg-black group">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs p-4 text-center">
            {error}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm transition-all duration-300">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-white" size={24} />
              <span className="text-[10px] text-white/80 font-mono tracking-widest">NEURAL SCAN</span>
            </div>
          </div>
        )}

        {detected && !isAnalyzing && (
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 to-transparent flex justify-center animate-fade-in">
            <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-sm font-bold text-white shadow-lg">
              {detected}
            </div>
          </div>
        )}

        {autoMode && !isAnalyzing && (
          <div className="absolute inset-0 pointer-events-none opacity-30">
            <div className="w-full h-[2px] bg-green-400 shadow-[0_0_10px_#4ade80] absolute top-0 animate-[grid_3s_linear_infinite]" />
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 relative">
        <div className="flex gap-2">
          <button
            onClick={handleCapture}
            disabled={isAnalyzing || !!error || autoMode}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all
                        ${autoMode
                ? 'bg-white/5 text-white/20 cursor-not-allowed'
                : 'bg-white text-black hover:bg-gray-200 shadow-lg'
              }
                    `}
          >
            <Aperture size={14} />
            SCAN
          </button>

          <button
            onClick={() => setAutoMode(!autoMode)}
            className={`px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all border
                        ${autoMode
                ? 'bg-green-500/20 border-green-500 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }
                    `}
            title="Real-time Detection"
          >
            {autoMode ? <Zap size={14} className="fill-current" /> : <ZapOff size={14} />}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-white/30">
          <Activity size={10} />
          <span>{autoMode ? 'CONTINUOUS MONITORING ACTIVE' : 'MANUAL MODE'}</span>
        </div>
      </div>
    </div>
  );
};