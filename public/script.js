document.addEventListener('DOMContentLoaded', () => {
    const micButton = document.getElementById('micButton');
    const statusDiv = document.getElementById('status');
    const socket = io();

    let isListening = false;
    let mediaRecorder;
    let audioContext;
    let audioChunks = [];
    let speaking = false;
    let interrupted = false;
    let micMonitor;

    async function setupAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    function playBeep(isStart) {
        if (!audioContext) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(isStart ? 600 : 300, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + (isStart ? 0.1 : 0.15));
    }

    micButton.addEventListener('click', async () => {
        if (!isListening && !speaking) {
            await startListening();
        }
    });

    async function startListening() {
        await setupAudio();
        playBeep(true);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            socket.emit('audio-message', audioBlob);
            updateUI('processing');
            stream.getTracks().forEach(track => track.stop());
            stopMicMonitor();
        };

        mediaRecorder.start();
        isListening = true;
        updateUI('listening');
        startMicMonitor(stream);
    }

    function stopListening() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        isListening = false;
    }

    // ✅ Final updated block for audio playback
    socket.on('audio-response', (audioData) => {
        console.log('📥 Received audio-response');

        try {
            const buffer = Buffer.from(audioData, 'base64');
            const blob = new Blob([new Uint8Array(buffer)], { type: 'audio/mpeg' });
            const url = URL.createObjectURL(blob);

            console.log('🔗 Audio URL:', url);

            const audio = new Audio(url);
            audio.onended = () => {
                console.log('✅ Audio playback ended');
                updateUI('idle', 'Click the mic to talk again');
                if (!interrupted) {
                    speaking = false;
                    setTimeout(() => startListening(), 600);
                }
            };
            audio.onerror = (e) => {
                console.error('❌ Audio playback error:', e);
            };

            audio.play().then(() => {
                console.log('🔊 Playback started');
                updateUI('speaking');
                speaking = true;
            }).catch(err => {
                console.warn('⚠️ Audio play failed:', err);
            });

        } catch (err) {
            console.error('💥 Error decoding or playing audio:', err);
            updateUI('error', 'Audio decode/playback failed.');
        }
    });

    socket.on('error', (data) => {
        console.error('Server Error:', data.message);
        updateUI('error', data.message);
        speaking = false;
    });

    function updateUI(state, message = '') {
        micButton.classList.remove('listening', 'speaking', 'processing');
        switch (state) {
            case 'listening':
                micButton.classList.add('listening');
                statusDiv.textContent = 'Listening... Click to stop';
                break;
            case 'speaking':
                micButton.classList.add('speaking');
                statusDiv.textContent = 'Speaking...';
                break;
            case 'processing':
                micButton.classList.add('processing');
                statusDiv.textContent = 'Thinking...';
                break;
            case 'error':
                statusDiv.textContent = `Error: ${message}`;
                break;
            case 'idle':
            default:
                statusDiv.textContent = message || 'Click the mic to start';
                break;
        }
    }

    function startMicMonitor(stream) {
        const micSource = audioContext.createMediaStreamSource(stream);
        micMonitor = audioContext.createAnalyser();
        micMonitor.fftSize = 512;
        micSource.connect(micMonitor);
        const data = new Uint8Array(micMonitor.frequencyBinCount);

        const checkVolume = () => {
            micMonitor.getByteFrequencyData(data);
            const volume = data.reduce((a, b) => a + b, 0) / data.length;

            if (speaking && volume > 30 && !interrupted) {
                interrupted = true;
                stopListening();
                speaking = false;
                updateUI('idle', 'Interrupted... restarting...');
                setTimeout(() => {
                    interrupted = false;
                    startListening();
                }, 500);
                return;
            }

            if (isListening || speaking) {
                requestAnimationFrame(checkVolume);
            }
        };

        checkVolume();
    }

    function stopMicMonitor() {
        if (micMonitor) {
            micMonitor.disconnect();
        }
    }
});
