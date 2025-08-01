# Revolt AI Voice Assistant 🔊🤖

A hands-free, real-time voice chatbot built using Google Gemini Pro, Google TTS, Socket.IO, and browser APIs — designed to replicate the Revolt Motors live assistant.

-------------------------------------------

🎯 FEATURES:
- 🎤 Speak to the AI, get voice replies (audio-to-audio)
- 🔁 Hands-free continuous voice interaction
- 🛑 Auto-interruption (speak to interrupt Gemini response)
- 🔊 Natural voice replies via Google TTS
- 🧠 Smart AI answers from Gemini Pro model
- 🖼️ Beautiful robot-themed UI

-------------------------------------------

🧩 TECHNOLOGIES USED:
- HTML, CSS, JavaScript
- Node.js, Express.js
- Socket.IO (client + server)
- Google Gemini Pro API
- Google Text-to-Speech API

-------------------------------------------

📦 SETUP INSTRUCTIONS:

1. Clone the repository:
   git clone https://github.com/your-username/revolt-voice-assistant.git
   cd revolt-voice-assistant

2. Install dependencies:
   npm install

3. Replace the Gemini API key:
   In server.js:
   const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

4. Run the server:
   node server.js

5. Visit in your browser:
   http://localhost:3000

-------------------------------------------

🎬 DEMO VIDEO:
Watch the assistant in action:
[Insert your demo video link here]

-------------------------------------------

📌 NOTES:
- For demo purposes, voice transcription is hardcoded.
- You can enable real transcription using ffmpeg + Google Speech-to-Text later.
- Audio auto-play issues are handled using fallback clicks and links.

-------------------------------------------

🛠️ HOW IT WORKS:

- User clicks mic → voice is recorded
- Audio is sent to server
- Gemini Pro replies with smart answer
- Google TTS converts it to audio
- Reply plays back to the user
- Hands-free loop continues unless stopped or interrupted

-------------------------------------------

🚀 FUTURE SCOPE:
- Real-time transcription from audio
- Host on Render or Railway
- Add conversation bubbles to UI
- Multilingual support

-------------------------------------------

👤 CREDITS:
- Built by [Your Name]
- Gemini Pro API (Google AI Studio)
- Google Cloud Text-to-Speech
- Socket.IO for real-time communication

-------------------------------------------

✅ Ready to run, submit, and impress!
