import asyncio
import os
import json
import cv2
import threading
import queue
import time
import base64
import numpy as np
from aiohttp import web, WSMsgType
from pathlib import Path

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------
PORT = int(os.environ.get("PORT", 10000))
DETECTOR_BACKEND = "ssd"
EMA_ALPHA = 0.3          # Smoothing factor
CONFIDENCE_THRESHOLD = 0.40
CALIBRATION_FRAMES = 20
EMOTIONS = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral']

# -----------------------------------------------------------------------------
# Global State
# -----------------------------------------------------------------------------
current_state = {
    "inner_state": 0.5,
    "emotion": "neutral",
    "intensity": 0.0,
    "status": "Initializing..."
}

def apply_clahe(image):
    """Contrast Limited Adaptive Histogram Equalization."""
    try:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl,a,b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    except: return image

# -----------------------------------------------------------------------------
# AI Thread (Advanced Logic)
# -----------------------------------------------------------------------------
class AIThread(threading.Thread):
    def __init__(self, input_queue):
        super().__init__(daemon=True)
        self.input_queue = input_queue
        self.running = True
        self.ema_scores = {e: 0.0 for e in EMOTIONS}
        self.last_committed_emotion = "neutral"
        self.candidate_emotion = None
        self.candidate_start_time = 0
        self.is_calibrating = True
        self.calibration_buffer = []
        self.rest_vector = {e: 0.0 for e in EMOTIONS}
        self.DeepFace = None

    def run(self):
        try:
            from deepface import DeepFace
            self.DeepFace = DeepFace
            dummy = np.zeros((100, 100, 3), dtype=np.uint8)
            DeepFace.analyze(img_path=dummy, actions=['emotion'], detector_backend=DETECTOR_BACKEND, enforce_detection=False, silent=True)
            current_state["status"] = "Calibrating (Sit Still)..."
        except Exception as e:
            current_state["status"] = f"AI Error: {e}"
            return

        while self.running:
            try:
                frame = self.input_queue.get(timeout=0.1)
            except queue.Empty:
                continue

            try:
                # 1. Preprocessing
                h, w = frame.shape[:2]
                target_size = 640
                scale = min(target_size/w, target_size/h)
                small_frame = cv2.resize(frame, (0, 0), fx=scale, fy=scale) if scale < 1.0 else frame
                small_frame = apply_clahe(small_frame)

                # 2. Raw Analysis
                results = self.DeepFace.analyze(img_path=small_frame, actions=['emotion'], detector_backend=DETECTOR_BACKEND, enforce_detection=False, silent=True)
                if not results:
                    self.decay_ema()
                    continue

                raw_scores = results[0]['emotion']
                total_score = sum(raw_scores.values())
                normalized_raw = {k: v / total_score for k, v in raw_scores.items()} if total_score > 0 else {e: 0.0 for e in EMOTIONS}

                # 3. Calibration Phase
                if self.is_calibrating:
                    self.calibration_buffer.append(normalized_raw)
                    if len(self.calibration_buffer) >= CALIBRATION_FRAMES:
                        self.finish_calibration()
                    continue

                # 4. Neural Subtraction (Remove Resting Face)
                adjusted_scores = {emo: max(0.0, normalized_raw.get(emo, 0.0) - self.rest_vector.get(emo, 0.0)) for emo in EMOTIONS}
                total_adj = sum(adjusted_scores.values())
                if total_adj > 0:
                    for k in adjusted_scores: adjusted_scores[k] /= total_adj
                else:
                    adjusted_scores = {e: 0.0 for e in EMOTIONS}; adjusted_scores['neutral'] = 1.0

                # 5. EMA Smoothing (Temporal Stability with Sqrt Scaling)
                for emo in EMOTIONS:
                    score = adjusted_scores.get(emo, 0.0)
                    self.ema_scores[emo] = (EMA_ALPHA * np.sqrt(score)) + ((1 - EMA_ALPHA) * self.ema_scores.get(emo, 0.0))

                # 6. Decision logic & FACS Disambiguation
                sorted_emotions = sorted(self.ema_scores.items(), key=lambda x: x[1], reverse=True)
                top_emotion, top_confidence = sorted_emotions[0]
                
                # Angry/Fear Disambiguation
                candidate_map = {e: s for e, s in sorted_emotions[:2]}
                if 'angry' in candidate_map and 'fear' in candidate_map:
                    if abs(candidate_map['angry'] - candidate_map['fear']) < 0.15:
                        if self.ema_scores.get('surprise', 0) > 0.10: self.ema_scores['fear'] += 0.20
                        if self.ema_scores.get('disgust', 0) > 0.10: self.ema_scores['angry'] += 0.20
                        top_emotion = max(self.ema_scores, key=self.ema_scores.get)
                        top_confidence = self.ema_scores[top_emotion]

                # Hysteresis Lock-in
                current_emo = current_state["emotion"]
                if current_emo in ['angry', 'fear'] and top_emotion in ['angry', 'fear'] and top_emotion != current_emo:
                    if top_confidence < (self.ema_scores.get(current_emo, 0) * 1.20):
                        top_emotion = current_emo
                        top_confidence = self.ema_scores[current_emo]

                resolved_emotion = top_emotion if top_confidence >= CONFIDENCE_THRESHOLD else "neutral"

                # 7. Temporal Stability Guard (Debounce)
                current_time = time.time()
                final_output_emotion = self.last_committed_emotion
                
                if resolved_emotion != self.last_committed_emotion:
                    if resolved_emotion != self.candidate_emotion:
                        self.candidate_emotion = resolved_emotion
                        self.candidate_start_time = current_time
                    else:
                        elapsed = current_time - self.candidate_start_time
                        required_duration = 0.5
                        if elapsed >= required_duration:
                            self.last_committed_emotion = resolved_emotion
                            final_output_emotion = resolved_emotion
                            self.candidate_emotion = None
                else:
                    self.candidate_emotion = None
                    final_output_emotion = resolved_emotion

                current_state["emotion"] = final_output_emotion
                current_state["intensity"] = float(top_confidence * 100)
                current_state["status"] = "Active"
                self.update_inner_state_momentum(final_output_emotion, top_confidence)

            except Exception: pass

    def decay_ema(self):
        for emo in EMOTIONS: self.ema_scores[emo] *= 0.9

    def finish_calibration(self):
        sums = {e: sum(v[e] for v in self.calibration_buffer) / len(self.calibration_buffer) for e in EMOTIONS}
        self.rest_vector = sums
        self.is_calibrating = False

    def update_inner_state_momentum(self, emotion, intensity):
        current = current_state["inner_state"]
        delta = 0.0
        if emotion in ['happy', 'neutral', 'surprise']:
            delta = 0.02 * (1.0 if emotion == 'neutral' else 2.0) * intensity
        elif emotion in ['angry', 'sad', 'fear', 'disgust']:
            delta = -0.05 * intensity
        current_state["inner_state"] = max(0.0, min(1.0, current + delta))

# -----------------------------------------------------------------------------
# Aiohttp Server
# -----------------------------------------------------------------------------
ai_queue = queue.Queue()

async def ws_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    
    # Send loop
    async def send_updates():
        while not ws.closed:
            await ws.send_json({
                "inner_state": float(current_state["inner_state"]),
                "emotion": current_state["emotion"],
                "status": current_state["status"]
            })
            await asyncio.sleep(0.2) # throttled updates

    task = asyncio.create_task(send_updates())
    
    try:
        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                data = json.loads(msg.data)
                if "image" in data:
                    img_data = base64.b64decode(data["image"])
                    nparr = np.frombuffer(img_data, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    if frame is not None and ai_queue.qsize() < 2:
                        ai_queue.put(frame)
    finally:
        task.cancel()
    return ws

async def health_check(request):
    return web.Response(text="OK")

def setup_routes(app):
    # Static files
    dist_path = Path(__file__).parent.parent / "dist"
    if dist_path.exists():
        app.router.add_static('/assets', path=dist_path / "assets", name='assets')
        async def index_handler(request):
            return web.FileResponse(dist_path / "index.html")
        app.router.add_get('/', index_handler)
    
    # WebSocket and Health
    app.router.add_get('/ws', ws_handler)
    app.router.add_get('/health', health_check)
    app.router.add_route('*', '/{tail:.*}', index_handler) # SPA Fallback

if __name__ == "__main__":
    ai_thread = AIThread(ai_queue)
    ai_thread.start()
    
    app = web.Application()
    setup_routes(app)
    web.run_app(app, host='0.0.0.0', port=PORT)
