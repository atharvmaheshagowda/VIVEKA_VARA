import asyncio
import websockets
import json
import cv2
import threading
import queue
import time
import sys
import base64
import numpy as np
from collections import deque, Counter

# Configuration
WS_PORT = 8765
CAMERA_INDEX = 0

# AI Configuration
# Options: 'opencv', 'ssd', 'dlib', 'mtcnn', 'retinaface', 'mediapipe'
# Switching to retinaface for better accuracy in backlit conditions
DETECTOR_BACKEND = "retinaface" 
SMOOTHING_WINDOW = 5 # Number of frames to smooth over

def adjust_gamma(image, gamma=1.0):
    invGamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** invGamma) * 255
        for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(image, table)

# Global State
current_state = {
    "inner_state": 0.5, # Starts neutral
    "emotion": "neutral",
    "status": "Initializing..."
}

# -----------------------------------------------------------------------------
# AI Thread (DeepFace)
# -----------------------------------------------------------------------------
class AIThread(threading.Thread):
    def __init__(self, input_queue):
        super().__init__(daemon=True)
        self.input_queue = input_queue
        self.running = True
        self.last_analysis_time = 0
        self.calm_start_time = None # Track start of calm/happy state
        self.emotion_buffer = deque(maxlen=SMOOTHING_WINDOW)
        
    def run(self):
        print(f"AI: Loading DeepFace ({DETECTOR_BACKEND})...")
        try:
            from deepface import DeepFace
            # Run a dummy analysis to load weights - create a black image
            dummy = np.zeros((100, 100, 3), dtype=np.uint8)
            DeepFace.analyze(img_path=dummy, actions=['emotion'], detector_backend=DETECTOR_BACKEND, enforce_detection=False, silent=True)
            print("AI: DeepFace modules imported.")
            current_state["status"] = "DeepFace Loaded. Waiting for frames..."
        except ImportError:
            print("AI: Critical Error - DeepFace not installed. Run 'pip install deepface'")
            current_state["status"] = "Error: DeepFace Missing"
            return
        except Exception as e:
            print(f"AI: Init Error: {e}")

        while self.running:
            try:
                frame = self.input_queue.get(timeout=0.1)
            except queue.Empty:
                continue

            try:
                # 1. Image Preprocessing
                h, w = frame.shape[:2]
                target_size = 640
                scale = min(target_size/w, target_size/h)
                
                if scale < 1.0:
                    small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)
                else:
                    small_frame = frame
                
                # Gamma Correction for Backlighting
                # Increase gamma to brighten dark faces (common with windows behind)
                small_frame = adjust_gamma(small_frame, gamma=1.5)
                
                results = DeepFace.analyze(
                    img_path=small_frame, 
                    actions=['emotion'], 
                    detector_backend=DETECTOR_BACKEND, 
                    enforce_detection=False, 
                    silent=True
                )
                
                if results:
                    # Get raw emotion from current frame
                    raw_emotion = results[0]['dominant_emotion']
                    scores = results[0]['emotion']
                    
                    # DEBUG: Print scores to see if happy is close
                    print(f"DEBUG: {raw_emotion.upper()} | Happy: {scores.get('happy',0):.1f}% | Neutral: {scores.get('neutral',0):.1f}%")
                    
                    # Add to buffer
                    self.emotion_buffer.append(raw_emotion)
                    
                    # Smoothing: Get most common emotion in buffer
                    if self.emotion_buffer:
                        smoothed_emotion = Counter(self.emotion_buffer).most_common(1)[0][0]
                    else:
                        smoothed_emotion = raw_emotion

                    current_state["emotion"] = smoothed_emotion
                    self.update_inner_state(smoothed_emotion)
                else:
                    print("DEBUG: No face detected.")
                    
            except Exception as e:
                print(f"AI Analysis Error: {e}")
                pass
                    
            except Exception as e:
                # print(f"AI Analysis Error: {e}") # Reduce spam
                pass

    def update_inner_state(self, emotion):
        # Logic: 
        # Happy/Neutral -> Calm (Increase)
        # Fear/Angry/Disgust/Sad -> Stress (Decrease)
        # No Face -> Freeze state
        
        target = 0.5
        change = 0.0
        current_time = time.time()
        
        if not emotion or "No Face" in emotion:
             self.calm_start_time = None # Reset buffer but don't drop state
             current_state["status"] = "Waiting for Player... (State Frozen)"
            #  print("No Face detected - Freezing State")
             return # EXIT EARLY - Do not change inner_state

        if emotion in ['happy', 'neutral']:
            if self.calm_start_time is None:
                self.calm_start_time = current_time
            
            # Check if held for > 3 seconds
            if current_time - self.calm_start_time > 3.0:
                change = 0.05
                
                # CAP Logic: Neutral cannot go above 0.8
                if emotion == 'neutral':
                    if current_state["inner_state"] > 0.8:
                        # Decay down to 0.8 if we are too high for neutral
                        change = -0.01 
                        print(f"Neutral Limit: Drifting down to 0.8... ({current_state['inner_state']:.2f})")
                    elif current_state["inner_state"] >= 0.8:
                        change = 0.0
                        print("Neutral Cap Reached (0.8). Smile to proceed.")
                    else:
                        # Below 0.8, Neutral raises it (already set change=0.05 above)
                        pass
            else:
                # Buffer period - no increase yet
                change = 0.0
                # print(f"Buffering Calm: {current_time - self.calm_start_time:.1f}s/3.0s")

        elif emotion in ['fear', 'angry', 'disgust', 'sad']:
            self.calm_start_time = None # Reset buffer
            change = -0.15 # DROP FAST (3x previous rate)
            
        elif emotion == 'surprise':
            self.calm_start_time = None # Reset buffer
            change = 0.0
            
        # Apply
        new_val = current_state["inner_state"] + change
        new_val = max(0.0, min(1.0, new_val))
        current_state["inner_state"] = new_val
        current_state["status"] = f"OK | Emo: {emotion} | State: {new_val:.2f}"
        print(f"Update: {emotion} -> {new_val:.2f}")

# -----------------------------------------------------------------------------
# WebSocket Server
# -----------------------------------------------------------------------------
ai_queue = queue.Queue() # Global queue for simplifiction in handler

async def handler(websocket):
    print(f"Client connected: {websocket.remote_address}")
    try:
        while True:
            # 1. Send Current State for every loop
            data_out = {
                "inner_state": current_state["inner_state"],
                "emotion": current_state["emotion"]
            }
            await websocket.send(json.dumps(data_out))

            # 2. Check for Incoming Data (Images) with a timeout
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                
                # Parse message
                try:
                    data_in = json.loads(message)
                    
                    # Handle Image Frame
                    if "image" in data_in:
                        # Decode Base64
                        img_data = base64.b64decode(data_in["image"])
                        np_arr = np.frombuffer(img_data, np.uint8)
                        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                        
                        if frame is not None:
                            # Push to AI Queue (Non-blocking drop if full)
                            if ai_queue.qsize() < 2: # Prevent backlog
                                ai_queue.put(frame)
                    
                    # Handle other commands if needed
                    
                except json.JSONDecodeError:
                    pass
                    
            except asyncio.TimeoutError:
                # No data received, just loop back to send state
                pass
            
            # await asyncio.sleep(0.01) # Small yielding
            
    except websockets.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")

async def main():
    print(f"Starting Backend on port {WS_PORT}...")
    
    # Start AI Thread
    ai_thread = AIThread(ai_queue)
    ai_thread.start()
    
    # NOTE: CameraThread is DISABLED to allow browser to use camera.
    # The browser will send frames via WebSocket.
    # cam_thread = CameraThread(ai_queue)
    # cam_thread.start()
    
    # Start Server
    async with websockets.serve(handler, "localhost", WS_PORT, max_size=10_000_000): # Increase max size for images
        print("WebSocket Server Running. Waiting for game client...")
        await asyncio.ensure_future(asyncio.Future()) # Run forever

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Stopping...")
