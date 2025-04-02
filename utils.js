// Storage keys for local storage
const STORAGE_KEYS = {
    SETTINGS: 'hangman_settings',
    STATS: 'hangman_stats'
};

// Game settings management
export class Settings {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return savedSettings ? JSON.parse(savedSettings) : {
            darkMode: true,
            soundEffects: true,
            difficulty: 'medium'
        };
    }

    saveSettings() {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    }

    getSetting(key) {
        return this.settings[key];
    }

    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
}

// Game statistics management
export class Statistics {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        const savedStats = localStorage.getItem(STORAGE_KEYS.STATS);
        return savedStats ? JSON.parse(savedStats) : {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            averageTime: 0
        };
    }

    saveStats() {
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(this.stats));
    }

    updateStats(won, timeSpent) {
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            
            // Update average time
            const totalGamesWon = this.stats.gamesWon;
            this.stats.averageTime = (this.stats.averageTime * (totalGamesWon - 1) + timeSpent) / totalGamesWon;
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.saveStats();
    }

    getStats() {
        return { ...this.stats };
    }
}

// Timer utility
export class Timer {
    constructor(callback) {
        this.callback = callback;
        this.startTime = 0;
        this.interval = null;
    }

    start() {
        this.startTime = Date.now();
        if (this.interval) clearInterval(this.interval);
        
        this.interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            if (this.callback) this.callback(elapsed);
        }, 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        return Math.floor((Date.now() - this.startTime) / 1000);
    }
}

// Share result utility
export function generateShareText(word, remainingAttempts, maxAttempts, timeSpent, won) {
    const emojis = won ? '🎉 🏆' : '😔';
    const usedAttempts = maxAttempts - remainingAttempts;
    const minutes = Math.floor(timeSpent / 60);
    const seconds = timeSpent % 60;
    
    return `Գախաղան ${emojis}\n\n` +
           `Բառը՝ ${word}\n` +
           `Փորձեր՝ ${usedAttempts}/${maxAttempts}\n` +
           `Ժամանակ՝ ${minutes}:${seconds.toString().padStart(2, '0')}\n\n` +
           `#Գախաղան #WesternArmenian`;
}

export { 
    Settings, 
    Statistics,
    Timer,
    generateShareText,
    STORAGE_KEYS 
};
