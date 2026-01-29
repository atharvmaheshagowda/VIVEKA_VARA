# Viveka Vara

> **A Generative Reality That Responds To Your Emotions.**

**Viveka Vara** is an immersive, emotion-reactive web application that creates a dynamic 2D environment reflecting your inner state. By analyzing text input, voice, or facial expressions, the system shifts the atmosphere, lighting, weather, and audio landscape in real-time to guide you towards clarity and balance.

---

## ✨ Key Features

*   **🎭 Emotion-Responsive Environments**
    The world changes based on 7 core emotions (Happy, Sad, Angry, Fear, Calm, Surprised, Neutral). A "Sad" state might bring rain and muted colors, while "Happy" brings golden sunlight and birds.

*   **🧠 Multimodal Analysis**
    *   **Text Analysis:** Uses **Gemini AI** to interpret the sentiment of your journals or thoughts.
    *   **Voice Analysis:** (Prototype) Detects emotional tone from speech.
    *   **Visual Analysis:** (Prototype) Uses camera input to detect facial expressions.

*   **🔊 Procedural Audio Engine**
    A custom Web Audio API engine generates ambient soundscapes (wind, rain, thunder, birds) on the fly, ensuring a unique auditory experience that matches the visual mood.

*   **🗣️ The Voice Guide**
    An integrated TTS (Text-to-Speech) guide that offers wisdom and context, capable of reciting the *Dakshinamurthy Stotram* to ground the user.

---

## 🛠️ Tech Stack

*   **Frontend:** React, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons)
*   **AI Integration:** Google Gemini API
*   **Audio:** Web Audio API (Procedural generation), Window.SpeechSynthesis (TTS)
*   **State Management:** React Hooks

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16+)
*   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/viveka-vara.git
    cd viveka-vara
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env.local` file in the root directory and add your API key:
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` (or the port shown) in your browser.

---

## 🎧 Audio Assets

This project includes generated audio assets for the offline experience. 
Check out the **[Audio Assets Documentation](./AUDIO_ASSETS.md)** for details on how to generate the welcome message and explanations using the included PowerShell scripts.

---

## 📂 Project Structure

```
viveka-vara/
├── components/         # React UI components
│   ├── DashboardView.tsx   # Main user dashboard
│   ├── SimulationView.tsx  # The 2D reactive world
│   ├── VoiceGuide.tsx      # TTS & Interaction logic
│   └── AmbientAudio.tsx    # Web Audio API engine
├── data/              # Static data & configuration
├── services/          # AI & API services
├── lib/               # Utilities
└── App.tsx            # Main application entry
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
