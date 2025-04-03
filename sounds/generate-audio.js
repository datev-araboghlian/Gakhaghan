// Simple audio data generator for game sounds
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function generateTone(frequency, duration, volume, type = 'sine') {
    const sampleRate = audioContext.sampleRate;
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        
        // Create the waveform based on type
        let sample = 0;
        const phase = 2 * Math.PI * frequency * t;
        
        switch (type) {
            case 'sine':
                sample = Math.sin(phase);
                break;
            case 'square':
                sample = Math.sin(phase) >= 0 ? 1 : -1;
                break;
            case 'sawtooth':
                sample = ((t * frequency) % 1) * 2 - 1;
                break;
            case 'noise':
                sample = Math.random() * 2 - 1;
                break;
        }
        
        // Apply envelope (simple fade in/out)
        const fadeInTime = 0.01;
        const fadeOutTime = 0.05;
        let envelope = 1;
        
        if (t < fadeInTime) {
            envelope = t / fadeInTime;
        } else if (t > duration - fadeOutTime) {
            envelope = (duration - t) / fadeOutTime;
        }
        
        channelData[i] = sample * volume * envelope;
    }
    
    return buffer;
}

// Generate key press sound
function generateKeySound() {
    // A short click sound
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.15, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        // Click with rapid decay
        data[i] = Math.random() * 0.2 * Math.exp(-t * 40);
    }
    
    return buffer;
}

// Generate correct guess sound - a rising tone
function generateCorrectSound() {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        // Rising frequency
        const freq = 300 + t * 900;
        data[i] = 0.3 * Math.sin(2 * Math.PI * freq * t) * (1 - t/0.3);
    }
    
    return buffer;
}

// Generate wrong guess sound - a descending tone
function generateWrongSound() {
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        // Descending frequency with a bit of dissonance
        const freq = 400 - t * 200;
        data[i] = 0.3 * Math.sin(2 * Math.PI * freq * t) * (1 - t/0.3);
    }
    
    return buffer;
}

// Generate win sound - a happy sequence
function generateWinSound() {
    const duration = 1.2;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // A happy ascending arpeggio
    const notes = [
        { freq: 440, start: 0.0, duration: 0.15 },   // A4
        { freq: 554, start: 0.15, duration: 0.15 },  // C#5
        { freq: 659, start: 0.3, duration: 0.15 },   // E5
        { freq: 880, start: 0.45, duration: 0.35 }   // A5 (longer final note)
    ];
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        let sample = 0;
        
        // Add each note
        for (const note of notes) {
            if (t >= note.start && t < note.start + note.duration) {
                const noteTime = t - note.start;
                // Envelope to avoid clicks
                const envelope = Math.min(1, noteTime * 10) * Math.min(1, (note.duration - noteTime) * 10);
                sample += 0.2 * Math.sin(2 * Math.PI * note.freq * noteTime) * envelope;
            }
        }
        
        data[i] = sample;
    }
    
    return buffer;
}

// Generate lose sound - a sad sequence
function generateLoseSound() {
    const duration = 1.2;
    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    // A sad descending arpeggio
    const notes = [
        { freq: 392, start: 0.0, duration: 0.15 },   // G4
        { freq: 349, start: 0.15, duration: 0.15 },  // F4
        { freq: 294, start: 0.3, duration: 0.15 },   // D4
        { freq: 220, start: 0.45, duration: 0.35 }   // A3 (longer final note)
    ];
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / audioContext.sampleRate;
        let sample = 0;
        
        // Add each note
        for (const note of notes) {
            if (t >= note.start && t < note.start + note.duration) {
                const noteTime = t - note.start;
                // Envelope to avoid clicks
                const envelope = Math.min(1, noteTime * 10) * Math.min(1, (note.duration - noteTime) * 10);
                sample += 0.2 * Math.sin(2 * Math.PI * note.freq * noteTime) * envelope;
            }
        }
        
        data[i] = sample;
    }
    
    return buffer;
}

// Convert AudioBuffer to WAV format
function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const numSamples = buffer.length;
    
    // Create WAV header
    const dataLength = numSamples * numChannels * 2; // 16-bit samples
    const headerLength = 44;
    const wavBuffer = new ArrayBuffer(headerLength + dataLength);
    const view = new DataView(wavBuffer);
    
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    writeString(view, 8, 'WAVE');
    
    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1 size (16 for PCM)
    view.setUint16(20, 1, true);  // Audio format (1 for PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
    view.setUint16(32, numChannels * 2, true); // Block align
    view.setUint16(34, 16, true); // Bits per sample
    
    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // Audio data
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            const sample = buffer.getChannelData(channel)[i];
            // Convert float to 16-bit signed integer
            const value = Math.max(-1, Math.min(1, sample));
            const int = value < 0 ? value * 0x8000 : value * 0x7FFF;
            view.setInt16(offset, int, true);
            offset += 2;
        }
    }
    
    return new Uint8Array(wavBuffer);
}

// Helper to write strings to DataView
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Create MP3 files (using WAV as fallback)
async function generateAllSounds() {
    const sounds = {
        'key': generateKeySound(),
        'correct': generateCorrectSound(),
        'wrong': generateWrongSound(),
        'win': generateWinSound(), 
        'lose': generateLoseSound()
    };
    
    for (const [name, buffer] of Object.entries(sounds)) {
        // Convert to WAV
        const wavData = audioBufferToWav(buffer);
        
        // Create Blob and download
        const blob = new Blob([wavData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.wav`;
        a.textContent = `Download ${name}.wav`;
        a.style.display = 'block';
        a.style.margin = '10px 0';
        
        document.body.appendChild(a);
        
        // Create play button
        const button = document.createElement('button');
        button.textContent = `Play ${name} sound`;
        button.onclick = () => {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContext.destination);
            source.start();
        };
        document.body.appendChild(button);
        document.body.appendChild(document.createElement('br'));
    }
}

// Initialize the audio context and generate sounds
document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML = '<h1>Audio Sound Generator</h1><p>Generate and download sounds for the game:</p>';
    
    const button = document.createElement('button');
    button.textContent = 'Generate All Sounds';
    button.onclick = generateAllSounds;
    document.body.appendChild(button);
});
