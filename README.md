<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Viveka Vara - A Generative Reality

**Viveka Vara** is a generative reality engine that responds to your emotions in real-time. By analyzing your voice, text, and facial expressions, the system shifts the atmosphere, weather, and world around you, creating a deeply immersive and reactive experience.

The project features a **Spirit Guide (Viveka)** that draws wisdom from the **Dakshinamurthy Stotra** to guide you through your emotional state, offering clarity and peace.

## ✨ Key Features

- **Generative Environment**: A reactive 2D world that visually shifts based on your emotional state (e.g., Calm, Turbulent, Melancholic).
- **Multi-Modal Emotion Detection**:
  - **Facial Analysis**: Real-time emotion detection using a local Python backend (DeepFace + RetinaFace).
  - **Voice Analysis**: Speech-to-text integration detects emotional intent from your spoken words.
  - **Text Analysis**: Sentiment analysis on typed input using Gemini AI.
- **Spirit Guide (Viveka)**: An AI entity that speaks to you with wisdom tailored to your current mood.
- **Privacy-First**: Facial analysis runs entirely locally on your machine.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** (Vite)
- **TypeScript**
- **Tailwind CSS** & **Framer Motion** (for animations)
- **Lucide React** (Icons)

### Backend (Local AI Bridge)
- **Python 3.8+**
- **DeepFace** (Facial Emotion Analysis)
- **WebSockets** (Real-time communication with frontend)
- **OpenCV** (Camera input processing)

---

## 🚀 Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.8+)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1. Clone & Frontend Setup
```bash
# Install Node dependencies
npm install
```

### 2. Configure Environment
1. Create a `.env.local` file in the root directory.
2. Add your Gemini API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend Setup
Install the required Python libraries for the Emotion Bridge:
```bash
pip install -r backend/requirements.txt
```
*Note: This installs DeepFace, OpenCV, WebSockets, etc.*

---

## 🎮 How to Run

### Method 1: Automatic Startup (Recommended)
Simply double-click or run the batch file:
```bash
start_app.bat
```
This script will:
1. Check for Node.js and Python.
2. Install missing dependencies.
3. Start the Python Backend (`emotion_bridge.py`).
4. Launch the React App in your default browser.

### Method 2: Manual Startup
If you prefer to run services separately:

**Terminal 1 (Backend):**
```bash
python backend/emotion_bridge.py
```
*Wait for "WebSocket Server Running" message.*

**Terminal 2 (Frontend):**
```bash
npm run dev
```

---

## 🧩 Project Structure
- **/components**: React UI components (Dashboard, Simulation, VoiceGuide).
- **/services**: API integrations (Gemini, Local Emotion Bridge).
- **/backend**: Python scripts for facial analysis.
- **/data**: Static data (Dakshinamurthy Stotra verses).

---

## 🔒 Privacy Note
The facial emotion detection is performed **locally** on your device using `cv2` and `DeepFace`. Your video feed is **not** sent to any cloud server. Only text/speech content is processed by Gemini AI for contextual wisdom.

