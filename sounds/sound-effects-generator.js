/**
 * Sound Effects Generator
 * This script generates audio sounds programmatically using the Web Audio API
 * and enables downloading them as MP3 files.
 */

// Initialize the audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

// Function to generate a "key press" sound
function generateKeySound() {
    const duration = 0.15; // Sound duration in seconds
    const audioBuffer = createAudioBuffer(duration);
    const channels = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        // Create a short "click" sound that fades out quickly
        const t = i / audioBuffer.sampleRate;
        channels[i] = (Math.random() * 0.2 - 0.1) * Math.exp(-t * 20);
    }
    
    return audioBuffer;
}

// Function to generate a "correct" sound
function generateCorrectSound() {
    const duration = 0.5; // Sound duration in seconds
    const audioBuffer = createAudioBuffer(duration);
    const channels = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        const t = i / audioBuffer.sampleRate;
        // A rising tone
        const freq1 = 500 + 200 * t;
        const freq2 = 800 + 400 * t; 
        channels[i] = 0.3 * Math.sin(2 * Math.PI * freq1 * t) * Math.exp(-3 * t) + 
                      0.3 * Math.sin(2 * Math.PI * freq2 * t) * Math.exp(-3 * t);
    }
    
    return audioBuffer;
}

// Function to generate a "wrong" sound
function generateWrongSound() {
    const duration = 0.5; // Sound duration in seconds
    const audioBuffer = createAudioBuffer(duration);
    const channels = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        const t = i / audioBuffer.sampleRate;
        // A descending harsh tone
        const freq = 400 - 100 * t;
        channels[i] = 0.3 * Math.sin(2 * Math.PI * freq * t) * Math.exp(-3 * t) +
                      0.1 * (Math.random() * 2 - 1) * Math.exp(-10 * t);
    }
    
    return audioBuffer;
}

// Function to generate a "win" sound
function generateWinSound() {
    const duration = 1.5; // Sound duration in seconds
    const audioBuffer = createAudioBuffer(duration);
    const channels = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        const t = i / audioBuffer.sampleRate;
        
        // Triumphant rising tone sequence
        let signal = 0;
        
        // First note
        if (t < 0.5) {
            const note1 = 440; // A4
            signal += 0.2 * Math.sin(2 * Math.PI * note1 * t) * Math.exp(-1 * (t - 0.25) * (t - 0.25));
        }
        
        // Second note
        if (t > 0.3 && t < 0.8) {
            const note2 = 554; // C#5
            signal += 0.2 * Math.sin(2 * Math.PI * note2 * (t - 0.3)) * Math.exp(-1 * (t - 0.55) * (t - 0.55));
        }
        
        // Third note
        if (t > 0.6 && t < 1.1) {
            const note3 = 659; // E5
            signal += 0.2 * Math.sin(2 * Math.PI * note3 * (t - 0.6)) * Math.exp(-1 * (t - 0.85) * (t - 0.85));
        }
        
        // Final note
        if (t > 0.9) {
            const note4 = 880; // A5
            signal += 0.2 * Math.sin(2 * Math.PI * note4 * (t - 0.9)) * Math.exp(-1 * (t - 1.25) * (t - 1.25));
        }
        
        channels[i] = signal;
    }
    
    return audioBuffer;
}

// Function to generate a "lose" sound
function generateLoseSound() {
    const duration = 1.5; // Sound duration in seconds
    const audioBuffer = createAudioBuffer(duration);
    const channels = audioBuffer.getChannelData(0);
    
    for (let i = 0; i < audioBuffer.length; i++) {
        const t = i / audioBuffer.sampleRate;
        
        // Sad descending tone sequence
        let signal = 0;
        
        // First note
        if (t < 0.5) {
            const note1 = 440; // A4
            signal += 0.2 * Math.sin(2 * Math.PI * note1 * t) * Math.exp(-1 * (t - 0.25) * (t - 0.25));
        }
        
        // Second note
        if (t > 0.3 && t < 0.8) {
            const note2 = 415; // G#4 - slightly lower
            signal += 0.2 * Math.sin(2 * Math.PI * note2 * (t - 0.3)) * Math.exp(-1 * (t - 0.55) * (t - 0.55));
        }
        
        // Third note
        if (t > 0.6 && t < 1.1) {
            const note3 = 370; // F#4 - even lower
            signal += 0.2 * Math.sin(2 * Math.PI * note3 * (t - 0.6)) * Math.exp(-1 * (t - 0.85) * (t - 0.85));
        }
        
        // Final note
        if (t > 0.9) {
            const note4 = 330; // E4 - lowest
            signal += 0.2 * Math.sin(2 * Math.PI * note4 * (t - 0.9)) * Math.exp(-1 * (t - 1.25) * (t - 1.25));
        }
        
        channels[i] = signal;
    }
    
    return audioBuffer;
}

// Helper function to create an audio buffer
function createAudioBuffer(duration) {
    const sampleRate = audioContext.sampleRate;
    const bufferSize = duration * sampleRate;
    return audioContext.createBuffer(1, bufferSize, sampleRate);
}

// Play the generated sound
function playSound(audioBuffer) {
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
}

// Convert audio buffer to WAV format
function audioBufferToWav(audioBuffer) {
    const numOfChannels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChannels * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChannels, true);
    view.setUint32(24, audioBuffer.sampleRate, true);
    view.setUint32(28, audioBuffer.sampleRate * numOfChannels * 2, true);
    view.setUint16(32, numOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    
    // Write audio data
    const channels = [];
    for (let i = 0; i < numOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }
    
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            // Convert to 16-bit signed integer
            view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
            offset += 2;
        }
    }
    
    return buffer;
}

// Helper function to write string to DataView
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// Create a download link for a sound
function createDownloadLink(audioBuffer, fileName) {
    const wav = audioBufferToWav(audioBuffer);
    const blob = new Blob([new Uint8Array(wav)], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.innerHTML = `Download ${fileName}`;
    a.className = 'download-button';
    
    return a;
}

// Event listener for the generate button
document.getElementById('generate-all').addEventListener('click', function() {
    // Generate all sounds
    const sounds = {
        'key.wav': generateKeySound(),
        'correct.wav': generateCorrectSound(),
        'wrong.wav': generateWrongSound(),
        'win.wav': generateWinSound(),
        'lose.wav': generateLoseSound()
    };
    
    // Clear previous results
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    
    // Create audio elements and download links for each sound
    for (const [name, buffer] of Object.entries(sounds)) {
        const soundDiv = document.createElement('div');
        soundDiv.className = 'sound-result';
        
        // Add sound name
        const soundName = document.createElement('h3');
        soundName.textContent = name;
        soundDiv.appendChild(soundName);
        
        // Add play button
        const playButton = document.createElement('button');
        playButton.textContent = 'Play Sound';
        playButton.addEventListener('click', () => playSound(buffer));
        soundDiv.appendChild(playButton);
        
        // Add download link
        const downloadLink = createDownloadLink(buffer, name);
        soundDiv.appendChild(downloadLink);
        
        // Add to results
        resultsDiv.appendChild(soundDiv);
    }
});
