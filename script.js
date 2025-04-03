import { wordData, getDailyWord, hasDailyChallengeBeenPlayed, markDailyChallengeAsPlayed, getRandomWord } from './data.js';

// Ensure we have window.AudioContext or webkitAudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext;

/**
 * Sound Manager Class
 * Handles all game sound effects
 */
class SoundManager {
    constructor() {
        // Default properties
        this.enabled = localStorage.getItem('soundEffects') !== 'false';
        this.audioContext = null;
        this.sounds = {};
        
        try {
            if (AudioContext) {
                this.audioContext = new AudioContext();
                console.log('Audio context created successfully');
            } else {
                console.warn('Audio API not supported in this browser');
            }
        } catch (e) {
            console.error('Error creating audio context:', e);
        }
    }
    
    // Generate a simple tone
    generateTone(frequency, duration, options = {}) {
        return {
            play: () => {
                if (!this.enabled || !this.audioContext) return;
                
                try {
                    const ctx = this.audioContext;
                    const now = ctx.currentTime;
                    
                    const oscillator = ctx.createOscillator();
                    const gainNode = ctx.createGain();
                    
                    oscillator.type = options.type || 'sine';
                    oscillator.frequency.value = frequency;
                    
                    gainNode.gain.value = options.volume || 0.3;
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(ctx.destination);
                    
                    oscillator.start(now);
                    oscillator.stop(now + duration);
                } catch (e) {
                    console.error('Error playing tone:', e);
                }
            }
        };
    }
    
    // Get or create a sound
    getSound(soundName) {
        if (!this.sounds[soundName]) {
            // Generate the sound on first request
            switch (soundName) {
                case 'key':
                    this.sounds[soundName] = this.generateTone(160, 0.08, { type: 'triangle', volume: 0.2 });
                    break;
                case 'correct':
                    this.sounds[soundName] = this.generateTone(400, 0.2, { type: 'sine', volume: 0.3 });
                    break;
                case 'wrong':
                    this.sounds[soundName] = this.generateTone(200, 0.3, { type: 'sawtooth', volume: 0.2 });
                    break;
                case 'win':
                    this.sounds[soundName] = this.generateTone(600, 0.5, { type: 'sine', volume: 0.3 });
                    break;
                case 'lose':
                    this.sounds[soundName] = this.generateTone(150, 0.5, { type: 'sine', volume: 0.3 });
                    break;
                case 'click':
                    this.sounds[soundName] = this.generateTone(300, 0.1, { type: 'triangle', volume: 0.15 });
                    break;
                case 'select':
                    this.sounds[soundName] = this.generateTone(350, 0.15, { type: 'sine', volume: 0.2 });
                    break;
                case 'start':
                    this.sounds[soundName] = this.generateTone(440, 0.3, { type: 'sine', volume: 0.25 });
                    break;
                case 'back':
                    this.sounds[soundName] = this.generateTone(250, 0.15, { type: 'triangle', volume: 0.2 });
                    break;
                default:
                    this.sounds[soundName] = this.generateTone(300, 0.2, { type: 'sine', volume: 0.2 });
            }
        }
        return this.sounds[soundName];
    }
    
    // Play a sound
    play(soundName) {
        if (!this.enabled) return;
        
        try {
            // Try to resume context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            // Get and play the sound
            const sound = this.getSound(soundName);
            if (sound) {
                sound.play();
                console.log(`Playing sound: ${soundName}`);
            }
        } catch (e) {
            console.error(`Error playing sound ${soundName}:`, e);
        }
    }
    
    // Set enabled/disabled state
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEffects', enabled);
    }
}

/**
 * Settings Class
 * Manages game settings like dark mode and sound effects
 */
class Settings {
    constructor() {
        this.settings = this.loadSettings();
    }
    
    loadSettings() {
        const savedSettings = localStorage.getItem('hangman_settings');
        return savedSettings ? JSON.parse(savedSettings) : {
            darkMode: true,
            soundEffects: true
        };
    }
    
    saveSettings() {
        localStorage.setItem('hangman_settings', JSON.stringify(this.settings));
    }
    
    getSetting(key) {
        return this.settings[key];
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }
}

/**
 * Hangman Drawing Class
 * Handles drawing the hangman in SVG
 */
class Hangman {
    constructor(svgElement) {
        this.svg = svgElement;
        this.parts = [
            this.drawGallows.bind(this),     // 0: Gallows
            this.drawHead.bind(this),        // 1: Head
            this.drawBody.bind(this),        // 2: Body
            this.drawLeftArm.bind(this),     // 3: Left arm
            this.drawRightArm.bind(this),    // 4: Right arm
            this.drawLeftLeg.bind(this),     // 5: Left leg
            this.drawRightLeg.bind(this)     // 6: Right leg
        ];
    }
    
    clear() {
        // Clear the SVG element
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
    }
    
    drawPart(partIndex) {
        if (partIndex >= 0 && partIndex < this.parts.length) {
            this.parts[partIndex]();
        }
    }
    
    // Draw the gallows
    drawGallows() {
        // Base
        this.createLine(20, 230, 180, 230);
        // Vertical pole
        this.createLine(60, 230, 60, 30);
        // Horizontal beam
        this.createLine(60, 30, 140, 30);
        // Support beam
        this.createLine(60, 60, 100, 30);
        // Rope
        this.createLine(140, 30, 140, 50);
    }
    
    // Draw the head
    drawHead() {
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', '140');
        head.setAttribute('cy', '70');
        head.setAttribute('r', '20');
        head.setAttribute('stroke', 'currentColor');
        head.setAttribute('stroke-width', '2');
        head.setAttribute('fill', 'none');
        this.svg.appendChild(head);
    }
    
    // Draw the body
    drawBody() {
        this.createLine(140, 90, 140, 150);
    }
    
    // Draw the left arm
    drawLeftArm() {
        this.createLine(140, 100, 110, 130);
    }
    
    // Draw the right arm
    drawRightArm() {
        this.createLine(140, 100, 170, 130);
    }
    
    // Draw the left leg
    drawLeftLeg() {
        this.createLine(140, 150, 110, 190);
    }
    
    // Draw the right leg
    drawRightLeg() {
        this.createLine(140, 150, 170, 190);
    }
    
    // Helper method to create a line
    createLine(x1, y1, x2, y2) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'currentColor');
        line.setAttribute('stroke-width', '2');
        this.svg.appendChild(line);
    }
}

/**
 * Statistics Class
 * Tracks and displays game statistics
 */
class Statistics {
    constructor() {
        this.stats = this.loadStats();
    }

    loadStats() {
        const savedStats = localStorage.getItem('hangman_stats');
        return savedStats ? JSON.parse(savedStats) : {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            bestTime: null,
            totalTime: 0
        };
    }

    saveStats() {
        localStorage.setItem('hangman_stats', JSON.stringify(this.stats));
    }

    updateStats(won, timeElapsed) {
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            
            if (this.stats.currentStreak > this.stats.maxStreak) {
                this.stats.maxStreak = this.stats.currentStreak;
            }
            
            // Track best time
            if (!this.stats.bestTime || timeElapsed < this.stats.bestTime) {
                this.stats.bestTime = timeElapsed;
            }
            
            // Add to total time
            this.stats.totalTime += timeElapsed;
        } else {
            this.stats.currentStreak = 0;
        }
        
        this.saveStats();
        this.updateDisplay();
    }

    updateDisplay() {
        // Format stats for display
        const winPercentage = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) 
            : 0;
        
        const avgTime = this.stats.gamesWon > 0 
            ? Math.round(this.stats.totalTime / this.stats.gamesWon) 
            : 0;
        
        // Update stats in the modal
        document.getElementById('gamesPlayed').textContent = this.stats.gamesPlayed;
        document.getElementById('gamesWon').textContent = this.stats.gamesWon;
        document.getElementById('winPercentage').textContent = `${winPercentage}%`;
        document.getElementById('currentStreak').textContent = this.stats.currentStreak;
        document.getElementById('maxStreak').textContent = this.stats.maxStreak;
        
        if (avgTime > 0) {
            document.getElementById('averageTime').textContent = this.formatTime(avgTime * 1000);
        } else {
            document.getElementById('averageTime').textContent = '--:--';
        }
    }
    
    // Format time as mm:ss
    formatTime(timeMs) {
        const seconds = Math.floor(timeMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Main Game Class
 * Manages game states and interactions
 */
class Game {
    constructor(soundManager, settingsManager, statsManager) {
        console.log('Game constructor called');
        
        // Store dependencies
        this.sounds = soundManager || new SoundManager();
        this.settings = settingsManager || new Settings();
        this.statistics = statsManager || new Statistics();
        
        // Game state
        this.currentWord = '';
        this.currentCategory = null;
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.gameMode = '';
        this.timerInterval = null;
        this.startTime = 0;
        this.handleKeyDown = null;
        
        try {
            // Validate essential UI elements
            console.log('Validating UI elements...');
            
            // Game screens
            this.homeScreen = document.getElementById('home-screen');
            this.categorySelection = document.getElementById('category-selection');
            this.gameArea = document.getElementById('game-area');
            
            if (!this.homeScreen) {
                throw new Error('Home screen element not found');
            }
            
            if (!this.categorySelection) {
                throw new Error('Category selection element not found');
            }
            
            if (!this.gameArea) {
                throw new Error('Game area element not found');
            }
            
            // Game elements - using querySelector for class elements
            this.wordDisplay = document.querySelector('.word-display');
            this.messageDisplay = document.querySelector('.message');
            this.timerDisplay = document.querySelector('.timer');
            
            if (!this.wordDisplay) {
                throw new Error('Word display element not found');
            }
            
            if (!this.messageDisplay) {
                throw new Error('Message display element not found');
            }
            
            if (!this.timerDisplay) {
                throw new Error('Timer display element not found');
            }
            
            // Hangman SVG
            const hangmanSvg = document.querySelector('.hangman-svg');
            if (hangmanSvg) {
                this.hangman = new Hangman(hangmanSvg);
            } else {
                throw new Error('Hangman SVG element not found');
            }
            
            console.log('All UI elements found and validated');
        } catch (error) {
            console.error('Error validating UI elements:', error);
            throw new Error('Failed to initialize game: ' + error.message);
        }
        
        // Initialize the game
        this.initialize();
    }
    
    // Initialize the game components
    initialize() {
        console.log('Initializing game components');
        
        // Setup button listeners
        this.setupButtonListeners();
        
        // Setup sound test buttons
        this.setupSoundTestButtons();
        
        // Apply dark mode from settings
        const darkMode = this.settings.getSetting('darkMode');
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        
        // Show home screen initially
        this.showScreen('home-screen');
        
        console.log('Game ready to play');
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Mode buttons (regular, daily challenge)
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.onclick = () => {
                const mode = btn.getAttribute('data-mode');
                console.log('Mode button clicked:', mode);
                this.resetGameState();
                this.setGameMode(mode);
            };
        });

        // Category buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.onclick = () => {
                const category = btn.getAttribute('data-category');
                console.log('Category button clicked:', category);
                this.selectCategory(category);
            };
        });

        // Keyboard buttons
        this.setupKeyboardEventListeners();

        // Restart game button
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.onclick = () => {
                console.log('Restart button clicked');
                this.getNewWordAndRestart();
            };
        }

        // Back buttons
        const backToHomeBtn = document.getElementById('back-to-home');
        if (backToHomeBtn) {
            backToHomeBtn.onclick = () => {
                console.log('Back to home button clicked');
                this.showHomeScreen();
            };
        }
        
        const backFromGameBtn = document.getElementById('back-from-game');
        if (backFromGameBtn) {
            backFromGameBtn.onclick = () => {
                console.log('Back from game button clicked');
                this.showHomeScreen();
            };
        }

        // Settings button
        const settingsBtn = document.getElementById('settings-btn');
        const closeSettingsBtn = document.querySelector('#settingsModal .close');
        const settingsModal = document.getElementById('settingsModal');
        if (settingsBtn && settingsModal) {
            settingsBtn.onclick = () => {
                settingsModal.style.display = 'block';
            };
            closeSettingsBtn.onclick = () => {
                settingsModal.style.display = 'none';
            };
        }
        
        // Test sounds button
        const testSoundsBtn = document.getElementById('test-all-sounds');
        if (testSoundsBtn) {
            testSoundsBtn.onclick = () => {
                console.log('Testing sounds...');
                setTimeout(() => this.sounds.play('correct'), 0);
                setTimeout(() => this.sounds.play('wrong'), 500);
                setTimeout(() => this.sounds.play('key'), 1000);
                setTimeout(() => this.sounds.play('win'), 1500);
                setTimeout(() => this.sounds.play('lose'), 2500);
            };
        }

        // Stats button
        const statsBtn = document.querySelector('.stats-btn');
        if (statsBtn) {
            statsBtn.onclick = () => {
                this.statistics.updateDisplay();
                const modal = document.getElementById('statsModal');
                if (modal) modal.style.display = 'block';
            };
        }

        // Help button
        const helpBtn = document.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.onclick = () => {
                const modal = document.getElementById('helpModal');
                if (modal) modal.style.display = 'block';
            };
        }

        // Close buttons for modals
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(closeBtn => {
            closeBtn.onclick = function() {
                const modal = this.closest('.modal');
                if (modal) modal.style.display = 'none';
            };
        });

        // Close modal when clicking outside
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
            }
        };

        // Dark mode toggle
        const darkModeCheckbox = document.getElementById('darkMode');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = this.settings.getSetting('darkMode');
            darkModeCheckbox.onchange = () => {
                this.settings.updateSetting('darkMode', darkModeCheckbox.checked);
                this.applyDarkMode();
            };
        }
        
        // Sound effects toggle
        const soundEffectsCheckbox = document.getElementById('soundEffects');
        if (soundEffectsCheckbox) {
            soundEffectsCheckbox.checked = this.settings.getSetting('soundEffects');
            soundEffectsCheckbox.onchange = () => {
                this.settings.updateSetting('soundEffects', soundEffectsCheckbox.checked);
                this.sounds.setEnabled(soundEffectsCheckbox.checked);
            };
        }
        
        // Setup sound test buttons
        this.setupSoundTestButtons();
    }
    
    /**
     * Set up sound test buttons in the settings modal
     */
    setupSoundTestButtons() {
        console.log('Setting up sound test buttons');
        
        // Find all sound test buttons
        const soundButtons = document.querySelectorAll('.sound-test-btn');
        if (soundButtons.length === 0) {
            console.warn('No sound test buttons found');
            return;
        }
        
        // Add click handlers to each button
        soundButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    // Get the sound name from data attribute
                    const soundName = btn.getAttribute('data-sound');
                    if (soundName) {
                        // Add visual feedback
                        btn.classList.add('active');
                        setTimeout(() => {
                            btn.classList.remove('active');
                        }, 200);
                        
                        // Play the sound
                        this.sounds.play(soundName);
                        console.log(`Testing sound: ${soundName}`);
                    }
                } catch (e) {
                    console.error('Error in sound test button:', e);
                }
            });
        });
        
        // "Test all sounds" button
        const testAllSoundsBtn = document.getElementById('test-sounds');
        if (testAllSoundsBtn) {
            testAllSoundsBtn.addEventListener('click', () => {
                console.log('Testing all sounds');
                
                const allSounds = ['key', 'correct', 'wrong', 'win', 'lose', 'click', 'select', 'start', 'back'];
                let delay = 0;
                
                allSounds.forEach(sound => {
                    setTimeout(() => {
                        this.sounds.play(sound);
                        console.log(`Playing sound: ${sound}`);
                    }, delay);
                    delay += 500; // Half second between sounds
                });
            });
        }
        
        // Set up sound checkbox
        const soundCheckbox = document.getElementById('soundEffects');
        if (soundCheckbox) {
            soundCheckbox.checked = this.settings.getSetting('soundEffects') !== false;
            
            soundCheckbox.addEventListener('change', () => {
                this.settings.updateSetting('soundEffects', soundCheckbox.checked);
                this.sounds.setEnabled(soundCheckbox.checked);
                
                // If enabling sounds, play a test sound
                if (soundCheckbox.checked) {
                    this.sounds.play('click');
                }
                
                console.log(`Sound effects ${soundCheckbox.checked ? 'enabled' : 'disabled'}`);
            });
        }
        
        // Set up dark mode checkbox
        const darkModeCheckbox = document.getElementById('darkMode');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = this.settings.getSetting('darkMode') !== false;
            
            darkModeCheckbox.addEventListener('change', () => {
                this.settings.updateSetting('darkMode', darkModeCheckbox.checked);
                document.documentElement.setAttribute('data-theme', darkModeCheckbox.checked ? 'dark' : 'light');
                
                // Play feedback sound
                this.sounds.play('click');
                
                console.log(`Dark mode ${darkModeCheckbox.checked ? 'enabled' : 'disabled'}`);
            });
        }
        
        console.log('Sound test buttons initialized');
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupKeyboardEventListeners() {
        console.log('Setting up keyboard event listeners');
        
        // Remove any existing listener to prevent duplicates
        if (this.handleKeyDown) {
            document.removeEventListener('keydown', this.handleKeyDown);
        }
        
        // Create new keyboard handler
        this.handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            
            // Only process letter keys
            if (/^[a-z]$/.test(key)) {
                // Only process keypresses when in game area
                if (this.gameArea.style.display === 'block') {
                    console.log(`Keyboard input: ${key}`);
                    this.sounds.play('key');
                    this.makeGuess(key);
                }
            }
        };
        
        // Attach the listener
        document.addEventListener('keydown', this.handleKeyDown);
        console.log('Keyboard event listener attached');
        
        // Set up on-screen keyboard
        const keyboardButtons = document.querySelectorAll('.key-btn');
        console.log(`Found ${keyboardButtons.length} on-screen keyboard buttons`);
        
        keyboardButtons.forEach(btn => {
            // Clear any existing handlers to prevent duplicates
            btn.onclick = null;
            
            // Add new click handler
            btn.onclick = () => {
                const letter = btn.getAttribute('data-letter');
                if (letter) {
                    console.log(`On-screen keyboard: ${letter}`);
                    this.sounds.play('key');
                    this.makeGuess(letter);
                }
            };
        });
        
        console.log('Keyboard setup complete');
    }
    
    /**
     * Reset game state completely
     */
    resetGameState() {
        console.log('Resetting game state');
        
        this.currentWord = '';
        this.currentCategory = null;
        this.guessedLetters.clear();
        this.remainingAttempts = 6;
        
        // Stop timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        // Clear any messages
        if (this.messageDisplay) {
            this.messageDisplay.textContent = '';
            this.messageDisplay.style.display = 'none';
        }
        
        // Reset hangman if initialized
        if (this.hangman) {
            this.hangman.clear();
            this.hangman.drawPart(0); // Draw the gallows
        }
        
        // Clear word display
        if (this.wordDisplay) {
            this.wordDisplay.innerHTML = '';
        }
        
        // Reset restart button visibility
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
    }
    
    /**
     * Show home screen and hide other screens
     */
    showHomeScreen() {
        console.log('Showing home screen');
        
        // Reset game state completely before switching screens
        this.resetGameState();
        
        // Show home screen, hide others
        this.showScreen('home-screen');
    }
    
    /**
     * Get a new word and restart the game
     */
    getNewWordAndRestart() {
        console.log('Getting new word and restarting game');
        
        // Reset game state first
        this.resetGameState();
        
        // Get a new word based on the current mode and category
        if (this.gameMode === 'regular') {
            this.currentWord = getRandomWord(this.currentCategory || null);
            console.log('New word for regular mode:', this.currentWord);
            
            // Show restart button for regular mode
            const restartBtn = document.getElementById('restart-game');
            if (restartBtn) {
                restartBtn.style.display = 'block';
            }
        } else if (this.gameMode === 'daily') {
            this.currentWord = getDailyWord();
            console.log('Daily challenge word:', this.currentWord);
            
            // Hide restart button for daily challenge
            const restartBtn = document.getElementById('restart-game');
            if (restartBtn) {
                restartBtn.style.display = 'none';
            }
        }
        
        // Ensure we have a valid word
        if (!this.currentWord || this.currentWord.length === 0) {
            console.error('Failed to get a valid word. Getting a fallback word.');
            // Fallback to any random word if no word was returned
            this.currentWord = getRandomWord(null);
        }
        
        // Start the game with the new word
        this.startNewGame();
    }

    /**
     * Set the game mode (regular or daily)
     */
    setGameMode(mode) {
        console.log('Setting game mode to:', mode);
        
        // Reset game state first
        this.resetGameState();
        
        this.gameMode = mode;
        
        // Play selection sound
        this.sounds.play('select');
        
        // Hide all screens first
        this.showScreen('home-screen');
        
        if (mode === 'regular') {
            // For regular mode, show category selection
            this.showScreen('category-selection');
            
            // Show back button for category selection
            const backBtn = document.getElementById('back-to-home');
            if (backBtn) backBtn.style.display = 'block';
        } else if (mode === 'daily') {
            // For daily challenge, check if it was already played today
            if (hasDailyChallengeBeenPlayed()) {
                console.log('Daily challenge already played today');
                alert('Դուք արդէն խաղացել էք այսօրուայ մարտահրաւէրը։ Վաղը նոր խաղ կը սկսի։');
                return;
            }
            
            // Mark the daily challenge as played
            markDailyChallengeAsPlayed();
            
            // Start a new game with the daily word
            this.showGameAreaForDailyChallenge();
        }
    }

    /**
     * Select a category and start a game
     */
    selectCategory(category) {
        console.log('Selecting category:', category);
        this.currentCategory = category;
        
        // Play selection sound
        this.sounds.play('select');
        
        // Hide category selection
        this.showScreen('game-area');
        
        // Get a random word from the category, ensuring it's NOT the daily word
        this.currentWord = getRandomWord(category);
        console.log('Selected random word from category:', this.currentWord);
        
        // Ensure we have a valid word
        if (!this.currentWord || this.currentWord.length === 0) {
            console.error('Failed to get a valid word from category. Getting a fallback word.');
            // Fallback to any random word if no word was returned
            this.currentWord = getRandomWord(null);
        }
        
        // Start a new game with the word
        this.startNewGame();
    }

    /**
     * Show a new game with the daily challenge word
     */
    showGameAreaForDailyChallenge() {
        // Hide other screens
        this.showScreen('game-area');
        
        // Get the daily word
        this.currentWord = getDailyWord();
        console.log('Daily word:', this.currentWord);
        
        // Hide restart button for daily mode
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.style.display = 'none';
        }
        
        // Start the game with the daily word
        this.startNewGame();
    }

    /**
     * Start a new game with the current word
     */
    startNewGame() {
        console.log('Starting new game with word:', this.currentWord);
        
        // Play start sound
        this.sounds.play('start');
        
        // Reset guesses and attempts
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        
        // Stop timer if running
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        // Clear previous hangman drawing
        if (this.hangman) {
            this.hangman.clear();
        }
        
        // Clear the message
        if (this.messageDisplay) {
            this.messageDisplay.textContent = '';
            this.messageDisplay.style.display = 'none';
        }
        
        // Update the display
        this.updateDisplay();
        
        // Reset and start the timer
        this.startTime = Date.now();
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Set up the keyboard
        this.setupKeyboardEventListeners();
    }

    /**
     * Display a specific screen and hide others
     */
    showScreen(screenId) {
        console.log(`Showing screen: ${screenId}`);
        
        // List of all screens
        const screens = ['home-screen', 'category-selection', 'game-area'];
        
        // Hide all screens first
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.style.display = 'none';
            } else {
                console.error(`Screen element not found: ${id}`);
            }
        });
        
        // Show the requested screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.style.display = 'block';
            console.log(`Screen ${screenId} is now visible`);
        } else {
            console.error(`Target screen not found: ${screenId}`);
        }
    }

    /**
     * Get a new word and restart the game (for restart button)
     */
    getNewWordAndRestart() {
        console.log('Getting new word and restarting game');
        
        // Play start sound
        this.sounds.play('start');
        
        // Get a new word
        this.currentWord = getRandomWord(this.currentCategory);
        console.log('New word:', this.currentWord);
        
        // Start a new game with the word
        this.startNewGame();
    }

    /**
     * Start a new game with the selected mode and category
     */
    startGame(mode, category = null) {
        console.log(`Starting game: mode=${mode}, category=${category}`);
        this.gameMode = mode;
        
        // Clear previous game state
        this.resetGame();
        
        // Setup keyboard event listeners
        this.setupKeyboardEventListeners();
        
        // Get word based on game mode
        if (mode === 'daily') {
            // Get daily challenge word
            this.currentWord = getDailyWord();
            
            // Mark daily challenge as played
            markDailyChallengeAsPlayed();
            
            console.log('Daily challenge started');
        } else {
            // Get random word from selected category
            this.currentCategory = category;
            this.currentWord = getRandomWord(category);
            console.log(`Regular game started with category: ${category}`);
        }
        
        // Show game area
        this.showScreen('game-area');
        
        // Display blank spaces for the word
        this.updateWordDisplay();
        
        // Reset message
        if (this.messageDisplay) {
            this.messageDisplay.textContent = '';
        }
        
        // Start timer
        this.startTime = Date.now();
        this.startTimer();
        
        // Play start sound
        this.sounds.play('start');
        
        console.log('Game started with word:', this.currentWord);
    }
    
    /**
     * Reset the game state
     */
    resetGame() {
        console.log('Resetting game state');
        
        this.currentWord = '';
        this.currentCategory = null;
        this.guessedLetters.clear();
        this.remainingAttempts = 6;
        
        // Clear the keyboard
        this.resetKeyboard();
        
        // Clear the hangman drawing
        if (this.hangman) {
            this.hangman.clear();
        } else {
            console.error('Hangman renderer not found');
        }
        
        // Clear timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Reset timer display
        if (this.timerDisplay) {
            this.timerDisplay.textContent = '00:00';
        }
        
        console.log('Game state reset complete');
    }
    
    /**
     * Reset the keyboard UI
     */
    resetKeyboard() {
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
    }
    
    /**
     * Update the word display with correctly guessed letters
     */
    updateWordDisplay() {
        if (!this.wordDisplay || !this.currentWord) return;
        
        const wordArray = this.currentWord.split('');
        const displayArray = wordArray.map(letter => 
            this.guessedLetters.has(letter.toLowerCase()) ? letter : '_'
        );
        
        this.wordDisplay.textContent = displayArray.join(' ');
        
        // Check if all letters have been guessed
        if (!displayArray.includes('_')) {
            this.endGame(true);
        }
    }
    
    /**
     * Start the game timer
     */
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            const elapsedTime = Date.now() - this.startTime;
            const formattedTime = this.formatTime(elapsedTime);
            
            if (this.timerDisplay) {
                this.timerDisplay.textContent = formattedTime;
            }
        }, 1000);
    }
    
    /**
     * Format time as mm:ss
     */
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * Process a letter guess
     */
    makeGuess(letter) {
        letter = letter.toLowerCase();
        
        // Check if the game is active and letter hasn't been guessed
        if (!this.currentWord || this.guessedLetters.has(letter)) {
            return;
        }
        
        console.log(`Player guessed: ${letter}`);
        
        // Add to guessed letters
        this.guessedLetters.add(letter);
        
        // Disable the corresponding keyboard button
        const button = document.querySelector(`.key-btn[data-letter="${letter}"]`);
        if (button) {
            button.disabled = true;
        }
        
        // Check if the letter is in the word
        if (this.currentWord.toLowerCase().includes(letter)) {
            // Correct guess
            this.sounds.play('correct');
            if (button) {
                button.classList.add('correct');
            }
            
            // Update the word display
            this.updateWordDisplay();
        } else {
            // Wrong guess
            this.sounds.play('wrong');
            if (button) {
                button.classList.add('wrong');
            }
            
            // Reduce attempts and update hangman
            this.remainingAttempts--;
            if (this.hangman) {
                this.hangman.drawPart(5 - this.remainingAttempts);
            }
            
            // Check if game is lost
            if (this.remainingAttempts <= 0) {
                this.endGame(false);
            }
        }
    }
    
    /**
     * End the game (win or lose)
     */
    endGame(isWin) {
        console.log(`Game ended: ${isWin ? 'won' : 'lost'}`);
        
        // Stop timer
        clearInterval(this.timerInterval);
        
        // Calculate elapsed time
        const endTime = Date.now();
        const elapsedTime = this.formatTime(endTime - this.startTime);
        
        // Update statistics
        this.statistics.updateStats(isWin, endTime - this.startTime);
        
        // Disable keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Play appropriate sound
        this.sounds.play(isWin ? 'win' : 'lose');
        
        // Show full word and message
        if (this.wordDisplay) {
            this.wordDisplay.textContent = this.currentWord;
        }
        
        // Display message
        let message = isWin ? 'Շնորհավորում ենք, Դուք հաղթեցիք!' : 'Ցավոք, Դուք պարտվեցիք!';
        if (this.messageDisplay) {
            this.messageDisplay.textContent = message;
        }
        
        // Show restart button if in regular mode
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            if (this.gameMode === 'regular') {
                restartBtn.style.display = 'inline-block';
            } else {
                restartBtn.style.display = 'none';
            }
        }
        
        // Show alert with game results
        setTimeout(() => {
            alert(`${message}\nԽաղացած ժամանակ: ${elapsedTime}`);
        }, 500);
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupKeyboardEventListeners() {
        console.log('Setting up keyboard event listeners');
        
        // Remove any existing listeners (to prevent duplicates)
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // Handle physical keyboard input
        this.handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            
            // Check if key is a letter
            if (/^[a-z]$/.test(key)) {
                this.makeGuess(key);
            }
        };
        
        // Add the event listener
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Add click handlers for on-screen keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            // Clear previous listeners
            btn.onclick = null;
            
            // Add new listener
            btn.onclick = () => {
                const letter = btn.getAttribute('data-letter');
                if (letter) {
                    this.makeGuess(letter);
                }
            };
        });
        
        console.log('Keyboard setup complete');
    }
    
    /**
     * Initialize the game
     */
    initialize() {
        console.log('Initializing game components...');
        
        // Set up event listeners for sounds test buttons
        this.setupSoundTestButtons();
        
        // Set up button event listeners
        this.setupButtonListeners();
        
        // Show the home screen to start
        this.showScreen('home-screen');
        
        // Apply dark mode from settings
        const darkMode = this.settings.getSetting('darkMode');
        document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
        
        console.log('Game initialization complete');
    }
    
    /**
     * Set up button listeners for menu and UI interactions
     */
    setupButtonListeners() {
        console.log('Setting up button listeners');
        
        // Play button - shows category selection
        const playBtn = document.getElementById('play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.showScreen('category-selection');
            });
        }
        
        // Back buttons
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.sounds.play('back');
                this.showScreen('home-screen');
            });
        });
        
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.getAttribute('data-category');
                if (category) {
                    this.sounds.play('select');
                    this.startGame('regular', category);
                }
            });
        });
        
        // Daily challenge button
        const dailyBtn = document.getElementById('daily-btn');
        if (dailyBtn) {
            dailyBtn.addEventListener('click', () => {
                this.sounds.play('start');
                this.startGame('daily');
            });
        }
        
        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        const settingsModal = document.getElementById('settingsModal');
        if (settingsBtn && settingsModal) {
            settingsBtn.addEventListener('click', () => {
                this.sounds.play('click');
                settingsModal.style.display = 'block';
            });
        }
        
        // Close settings
        const closeSettings = document.querySelector('#settingsModal .close');
        if (closeSettings && settingsModal) {
            closeSettings.addEventListener('click', () => {
                this.sounds.play('back');
                settingsModal.style.display = 'none';
            });
        }
        
        // Stats button
        const statsBtn = document.querySelector('.stats-btn');
        const statsModal = document.getElementById('statsModal');
        if (statsBtn && statsModal) {
            statsBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.statistics.updateDisplay();
                statsModal.style.display = 'block';
            });
        }
        
        // Close stats
        const closeStats = document.querySelector('#statsModal .close');
        if (closeStats && statsModal) {
            closeStats.addEventListener('click', () => {
                this.sounds.play('back');
                statsModal.style.display = 'none';
            });
        }
        
        // Help button
        const helpBtn = document.querySelector('.help-btn');
        const helpModal = document.getElementById('helpModal');
        if (helpBtn && helpModal) {
            helpBtn.addEventListener('click', () => {
                this.sounds.play('click');
                helpModal.style.display = 'block';
            });
        }
        
        // Close help
        const closeHelp = document.querySelector('#helpModal .close');
        if (closeHelp && helpModal) {
            closeHelp.addEventListener('click', () => {
                this.sounds.play('back');
                helpModal.style.display = 'none';
            });
        }
        
        // Restart button
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.sounds.play('click');
                this.resetGame();
                this.showScreen('category-selection');
            });
        }
        
        // Play button on home screen
        const playButton = document.querySelector('.mode-btn[data-mode="regular"]');
        if (playButton) {
            playButton.addEventListener('click', () => {
                this.sounds.play('click');
                this.showScreen('category-selection');
            });
        }
        
        console.log('Button listeners initialized');
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing Hangman game');
    
    try {
        console.log('Step 1: Creating SoundManager');
        const soundManager = new SoundManager();
        
        console.log('Step 2: Creating Settings');
        const settingsManager = new Settings();
        
        console.log('Step 3: Creating Statistics');
        const statsManager = new Statistics();
        
        console.log('Step 4: Creating Game instance');
        const game = new Game(soundManager, settingsManager, statsManager);
        
        console.log('Step 5: Storing game instance globally');
        window.gameInstance = game;
        
        console.log('Step 6: Setting up audio resumption');
        // Resume audio on first user interaction
        document.addEventListener('click', function resumeAudio() {
            console.log('User interaction detected - attempting to resume audio context');
            if (soundManager.audioContext && soundManager.audioContext.state === 'suspended') {
                soundManager.audioContext.resume();
                console.log('Audio context resumed by user interaction');
            }
            document.removeEventListener('click', resumeAudio);
        }, { once: true });
        
        console.log('Game initialization complete');
    } catch (error) {
        console.error('DETAILED ERROR:', error);
        console.error('ERROR MESSAGE:', error.message);
        console.error('ERROR STACK:', error.stack);
        console.dir(error);  // Log the entire error object
        alert('Error initializing game: ' + error.message + '. Check console for details.');
    }
});

// Add global error handler to catch any uncaught errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('GLOBAL ERROR CAUGHT:');
    console.error('Message:', message);
    console.error('Source:', source);
    console.error('Line:', lineno);
    console.error('Column:', colno);
    console.error('Error object:', error);
    
    // Alert user with a friendlier message
    alert('An error occurred while running the game. Please check the console for details.');
    
    return true; // Prevents the default browser error handler
};

// Add element validation function
function validateElement(id, name) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`CRITICAL ERROR: ${name} element (${id}) not found`);
        throw new Error(`${name} element not found`);
    }
    return element;
}
