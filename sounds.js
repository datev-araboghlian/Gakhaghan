class SoundManager {
    constructor() {
        this.enabled = true;
    }

    play(soundType) {
        if (!this.enabled) return;
        
        const beep = (freq, duration) => {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            
            oscillator.connect(gain);
            gain.connect(context.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, context.currentTime);
            gain.gain.linearRampToValueAtTime(0.5, context.currentTime + 0.01);
            gain.gain.linearRampToValueAtTime(0, context.currentTime + duration);
            
            oscillator.start(context.currentTime);
            oscillator.stop(context.currentTime + duration);
        };

        switch (soundType) {
            case 'correct':
                beep(880, 0.15); // High beep
                break;
            case 'wrong':
                beep(220, 0.3); // Low beep
                break;
            case 'win':
                beep(440, 0.1);
                setTimeout(() => beep(554.37, 0.1), 100);
                setTimeout(() => beep(659.25, 0.3), 200);
                break;
            case 'lose':
                beep(440, 0.2);
                setTimeout(() => beep(415.30, 0.2), 200);
                setTimeout(() => beep(392.00, 0.4), 400);
                break;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

export const soundEffects = new SoundManager();
