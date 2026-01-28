import asyncio
import os
import websockets
import json
import cv2
import threading
import queue
import time
import base64
import numpy as np
from collections import deque, Counter

# -----------------------------------------------------------------------------
# Configuration & Constants
# -----------------------------------------------------------------------------
WS_PORT = 8765
DETECTOR_BACKEND = "ssd" # Fast and reasonably accurate
EMA_ALPHA = 0.3          # Smoothing factor (0.1 = slow/smooth, 1.0 = instant)
CONFIDENCE_THRESHOLD = 0.40 # 40% minimum confidence
CALIBRATION_FRAMES = 20  # Number of frames to learn "rest face"

EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# -----------------------------------------------------------------------------
# Global State
# -----------------------------------------------------------------------------
current_state = {
    "inner_state": 0.5,    # 0.0 (Stress) to 1.0 (Calm)
    "emotion": "neutral",
    "intensity": 0.0,      # 0.0 to 100.0
    "status": "Initializing..."
}

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------
def apply_clahe(image):
    """
    Contrast Limited Adaptive Histogram Equalization.
    Enhances local details (eyebrows, lips) to fix backlighting/flatness.
    """
    try:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl,a,b))
        final = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        return final
    except Exception:
        return image

# -----------------------------------------------------------------------------
# AI Thread (DeepFace + Advanced Logic)
# -----------------------------------------------------------------------------
class AIThread(threading.Thread):
    def __init__(self, input_queue):
        super().__init__(daemon=True)
        self.input_queue = input_queue
        self.running = True
        
        # Affective State Variables
        self.ema_scores = {e: 0.0 for e in EMOTIONS} # Current smooth state
        
        # STABILITY: Debounce State Machine
        self.last_committed_emotion = "neutral"
        self.candidate_emotion = None
        self.candidate_start_time = 0
        
        # Calibration Variables
        self.is_calibrating = True
        self.calibration_buffer = [] # Store raw vectors
        self.rest_vector = {e: 0.0 for e in EMOTIONS} # The "Resting Face" baseline
        
        # DeepFace lazy loader
        self.DeepFace = None 

    def run(self):
        print(f"AI: Loading DeepFace ({DETECTOR_BACKEND})...")
        try:
            from deepface import DeepFace
            self.DeepFace = DeepFace
            # Warmup
            dummy = np.zeros((100, 100, 3), dtype=np.uint8)
            DeepFace.analyze(img_path=dummy, actions=['emotion'], detector_backend=DETECTOR_BACKEND, enforce_detection=False, silent=True)
            print("AI: DeepFace modules imported.")
            current_state["status"] = "Calibrating (Sit Still)..."
        except Exception as e:
            print(f"AI: Init Error: {e}")
            current_state["status"] = "AI Error"
            return

        while self.running:
            try:
                frame = self.input_queue.get(timeout=0.1)
            except queue.Empty:
                continue

            try:
                # -------------------------------------------------------------
                # 1. Preprocessing
                # -------------------------------------------------------------
                h, w = frame.shape[:2]
                target_size = 640
                scale = min(target_size/w, target_size/h)
                if scale < 1.0:
                    small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale)
                else:
                    small_frame = frame
                
                # Apply CLAHE for detail enhancement
                small_frame = apply_clahe(small_frame)

                # -------------------------------------------------------------
                # 2. Raw Analysis
                # -------------------------------------------------------------
                results = self.DeepFace.analyze(
                    img_path=small_frame, 
                    actions=['emotion'], 
                    detector_backend=DETECTOR_BACKEND, 
                    enforce_detection=False, 
                    silent=True
                )

                if not results:
                    # No face detected
                    # Decay intensity but keep last emotion? Or drift to neutral?
                    # Let's drift EMA towards zero confidence
                    self.decay_ema() 
                    continue

                raw_scores = results[0]['emotion'] # dict {'happy': 0.02, ...}
                
                # Normalize DeepFace scores (sometimes they sum > 100 or are weighted oddly)
                # We want a proper probability vector summing to 1.0
                total_score = sum(raw_scores.values())
                if total_score > 0:
                    normalized_raw = {k: v / total_score for k, v in raw_scores.items()}
                else:
                    normalized_raw = {e: 0.0 for e in EMOTIONS}

                # -------------------------------------------------------------
                # 3. Calibration Phase
                # -------------------------------------------------------------
                if self.is_calibrating:
                    self.calibration_buffer.append(normalized_raw)
                    progress = len(self.calibration_buffer) / CALIBRATION_FRAMES
                    current_state["status"] = f"Calibrating... {int(progress*100)}%"
                    print(f"Calibrating: {len(self.calibration_buffer)}/{CALIBRATION_FRAMES}")
                    
                    if len(self.calibration_buffer) >= CALIBRATION_FRAMES:
                        self.finish_calibration()
                    
                    continue # Skip normal processing during calibration

                # -------------------------------------------------------------
                # 4. Neural Subtraction (Remove Resting Face)
                # -------------------------------------------------------------
                # Logic: adjusted = raw - rest_vector
                # If your resting face is 20% Sad, and you show 25% Sad, the adjusted is 5% Sad.
                
                adjusted_scores = {}
                for emo in EMOTIONS:
                    # Calculate delta
                    delta = normalized_raw.get(emo, 0.0) - self.rest_vector.get(emo, 0.0)
                    # Clip at zero (cannot have negative probability)
                    adjusted_scores[emo] = max(0.0, delta)
                
                # Re-normalize after subtraction
                total_adj = sum(adjusted_scores.values())
                if total_adj > 0:
                    for k in adjusted_scores:
                        adjusted_scores[k] /= total_adj
                else:
                    # If everything was subtracted (perfect match to rest), assume Neutral
                    adjusted_scores = {e: 0.0 for e in EMOTIONS}
                    adjusted_scores['neutral'] = 1.0

                # -------------------------------------------------------------
                # 5. EMA Smoothing (Temporal Stability)
                # -------------------------------------------------------------
                # SCALING: Square-Root Scaling (User Request)
                # Boosts lower confidence scores (like Surprise/Disgust) for tie-breaking
                for emo in EMOTIONS:
                    score = adjusted_scores.get(emo, 0.0)
                    # S[t] = alpha * sqrt(Y[t]) + (1-alpha) * S[t-1]
                    # Note: We scale the input, not the average
                    scaled_score = np.sqrt(score) 
                    self.ema_scores[emo] = (EMA_ALPHA * scaled_score) + \
                                           ((1 - EMA_ALPHA) * self.ema_scores.get(emo, 0.0))

                # -------------------------------------------------------------
                # 6. Decision Logic (Dominant Emotion) & FACS Disambiguation
                # -------------------------------------------------------------
                
                # A. Identify top candidates
                # sort emotions by EMA score
                sorted_emotions = sorted(self.ema_scores.items(), key=lambda x: x[1], reverse=True)
                top_emotion, top_confidence = sorted_emotions[0]
                
                # B. Angry/Fear Disambiguation Matrix
                # If the top two are Angry and Fear (in either order) and close
                candidate_map = {e: s for e, s in sorted_emotions[:2]}
                if 'angry' in candidate_map and 'fear' in candidate_map:
                    s_angry = candidate_map['angry']
                    s_fear = candidate_map['fear']
                    
                    # If they are within 15% of each other
                    if abs(s_angry - s_fear) < 0.15:
                        print("DEBUG: Ambiguous Angry/Fear - Check Tie-Breakers")
                        
                        # Tie-Breaker 1: Surprise indicates Fear
                        if self.ema_scores.get('surprise', 0) > 0.10:
                            print("  -> Surprise detected! Boosting FEAR.")
                            self.ema_scores['fear'] += 0.20 # Push Fear up
                        
                        # Tie-Breaker 2: Disgust indicates Anger
                        if self.ema_scores.get('disgust', 0) > 0.10:
                            print("  -> Disgust detected! Boosting ANGRY.")
                            self.ema_scores['angry'] += 0.20 # Push Angry up

                        # Re-evaluate top after boosting
                        top_emotion = max(self.ema_scores, key=self.ema_scores.get)
                        top_confidence = self.ema_scores[top_emotion]

                # C. Hysteresis (Lock-in)
                # If we are already in a state, require a stronger signal to switch
                current_emo = current_state["emotion"]
                if current_emo in ['angry', 'fear'] and top_emotion in ['angry', 'fear'] and top_emotion != current_emo:
                    # Trying to switch between Angry/Fear
                    # Require new emotion to be 20% stronger than current
                    current_score = self.ema_scores.get(current_emo, 0)
                    if top_confidence < (current_score * 1.20):
                        # Not strong enough to break lock
                        top_emotion = current_emo
                        top_confidence = current_score
                        # print(f"  -> Hysteresis Lock: Kept {current_emo.upper()}")

                # Threshold Check
                if top_confidence < CONFIDENCE_THRESHOLD:
                    # Low confidence -> fallback to Neutral/Ambiguous
                    resolved_emotion = "neutral"
                else:
                    resolved_emotion = top_emotion
                
                # -------------------------------------------------------------
                # 7. Temporal Stability Guard (1.2s Debounce)
                # -------------------------------------------------------------
                current_time = time.time()
                final_output_emotion = self.last_committed_emotion # Default to staying same
                
                # If we see a NEW emotion that is different from what we are currently showing
                if resolved_emotion != self.last_committed_emotion:
                    
                    # Check if this is a NEW candidate or the same one we've been waiting for
                    if resolved_emotion != self.candidate_emotion:
                        # It's a brand new candidate. Start the timer.
                        self.candidate_emotion = resolved_emotion
                        self.candidate_start_time = current_time
                        # print(f"DEBUG: Candidate Start -> {resolved_emotion} (0.0s)")
                    
                    else:
                        # It matches the candidate we are waiting for. Check duration.
                        elapsed = current_time - self.candidate_start_time
                        
                        # Determine required duration
                        if resolved_emotion == 'neutral':
                            required_duration = 0.5 # Faster release for Neutral
                        else:
                            required_duration = 0.5 # Reduced to 0.5s (User Request)
                            
                        # Did we pass the test?
                        if elapsed >= required_duration:
                            # YES! Commit the change.
                            self.last_committed_emotion = resolved_emotion
                            final_output_emotion = resolved_emotion
                            self.candidate_emotion = None # Reset
                            print(f"STABILITY: Committed -> {resolved_emotion.upper()} (after {elapsed:.1f}s)")
                        else:
                            # Waiting...
                            pass
                            # print(f"DEBUG: Waiting for {resolved_emotion}... ({elapsed:.1f}/{required_duration}s)")
                
                else:
                    # The resolved emotion MATCHES the committed one.
                    # We are stable. Reset candidate.
                    self.candidate_emotion = None
                    final_output_emotion = resolved_emotion

                # Update Global State with the COMMITTED emotion
                current_state["emotion"] = final_output_emotion
                current_state["intensity"] = float(top_confidence * 100)
                current_state["status"] = "Active"

                # -------------------------------------------------------------
                # 8. Momentum-Based Inner State Update
                # -------------------------------------------------------------
                self.update_inner_state_momentum(final_output_emotion, top_confidence)
                
                # Debug Output (Only show committed)
                # print(f"Emo: {final_output_emotion.upper()} ({top_confidence*100:.1f}%) | State: {current_state['inner_state']:.2f}")

            except Exception as e:
                print(f"AI Loop Error: {e}")
                pass

    def decay_ema(self):
        """Drift all scores towards zero/neutral if face is lost."""
        for emo in EMOTIONS:
            self.ema_scores[emo] *= 0.9 # Fast decay

    def finish_calibration(self):
        """Calculate average vector from buffer."""
        print("Calibration Complete. Computing baseline...")
        
        sums = {e: 0.0 for e in EMOTIONS}
        for vec in self.calibration_buffer:
            for emo, val in vec.items():
                sums[emo] += val
        
        count = len(self.calibration_buffer)
        self.rest_vector = {e: s / count for e, s in sums.items()}
        
        self.is_calibrating = False
        
        # Debrief
        print("--- RESTING FACE BASELINE ---")
        for e, v in self.rest_vector.items():
            if v > 0.05: print(f"  {e.upper()}: {v*100:.1f}%")
        print("-----------------------------")

    def update_inner_state_momentum(self, emotion, intensity):
        """
        Change inner_state based on emotion physics.
        rate = base_rate * intensity
        """
        current = current_state["inner_state"]
        delta = 0.0
        
        # Base Rates (per frame)
        CHARGE_RATE = 0.02
        DRAIN_RATE = 0.05 
        
        if emotion in ['happy', 'neutral', 'surprise']:
            # CHARGING (Calm)
            # Happy charges faster than Neutral
            multiplier = 1.0 if emotion == 'neutral' else 2.0 
            # Intensity multiplier: 50% sure = 0.5x, 100% sure = 1.0x
            delta = CHARGE_RATE * multiplier * intensity
            
        elif emotion in ['angry', 'sad', 'fear', 'disgust']:
            # DRAINING (Stress)
            # Negative emotions drain fast
            delta = -DRAIN_RATE * intensity
            
        # Apply Momentum
        new_val = current + delta
        new_val = max(0.0, min(1.0, new_val))
        current_state["inner_state"] = float(new_val)

# -----------------------------------------------------------------------------
# WebSocket Server
# -----------------------------------------------------------------------------
ai_queue = queue.Queue()

async def handler(websocket):
    print(f"Client connected: {websocket.remote_address}")
    try:
        while True:
            # Send State
            data_out = {
                "inner_state": float(current_state["inner_state"]),
                "emotion": current_state["emotion"],
                "status": current_state["status"]
            }
            await websocket.send(json.dumps(data_out))

            # Receive Frame
            try:
                message = await asyncio.wait_for(websocket.recv(), timeout=0.1)
                data_in = json.loads(message)
                if "image" in data_in:
                    img_data = base64.b64decode(data_in["image"])
                    np_arr = np.frombuffer(img_data, np.uint8)
                    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                    if frame is not None and ai_queue.qsize() < 2:
                        ai_queue.put(frame)
            except (asyncio.TimeoutError, json.JSONDecodeError):
                pass
            except Exception:
                pass
            
    except websockets.ConnectionClosed:
        print("Client disconnected")

async def main():
    host = "0.0.0.0"
    port = int(os.environ.get("PORT", WS_PORT))
    print(f"Starting Advanced Emotion Backend on {host}:{port}...")
    ai_thread = AIThread(ai_queue)
    ai_thread.start()
    async with websockets.serve(handler, host, port, max_size=10_000_000):
        print("Server Running.")
        await asyncio.to_thread(ai_thread.join) # Keep main alive

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
