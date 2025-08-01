const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

const GEMINI_API_KEY = 'gemini api key';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;
const TTS_API = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`;

io.on('connection', (socket) => {
  console.log('🔌 Client connected');

  socket.on('audio-message', async (audioBlob) => {
    const id = uuidv4();
    const filePath = path.join(__dirname, `temp-${id}.webm`);

    try {
      // Save audio blob to file (optional if you want to inspect it later)
      fs.writeFileSync(filePath, Buffer.from(new Uint8Array(audioBlob)));

      // 🔁 For demo: skip transcription — just send hardcoded question to Gemini
      const transcript = "Tell me about Revolt RV400";
      console.log('🗣️ Transcript:', transcript);

      // 🤖 Ask Gemini
      const geminiRes = await axios.post(GEMINI_API_URL, {
        contents: [{ role: 'user', parts: [{ text: transcript }] }]
      });

      const reply = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't get an answer.";
      console.log('🤖 Gemini reply:', reply);

      // 🔊 Convert text to speech (Google TTS)
      const ttsRes = await axios.post(TTS_API, {
        input: { text: reply },
        voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3' }
      });

      const audioContent = ttsRes.data.audioContent;
      socket.emit('audio-response', audioContent);
    } catch (err) {
      console.error('❌ Error:', err.message);
      socket.emit('error', { message: 'Something went wrong.' });
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
