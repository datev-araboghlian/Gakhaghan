import { wordData, getDailyWord, hasDailyChallengeBeenPlayed, markDailyChallengeAsPlayed, getRandomWord } from './data.js';

/**
 * Sound Manager Class
 * Handles all game sound effects
 */
class SoundManager {
    constructor() {
        // Define sound files
        this.soundFiles = {
            correct: 'sounds/correct.mp3',
            wrong: 'sounds/wrong.mp3',
            win: 'sounds/win.mp3',
            lose: 'sounds/lose.mp3',
            key: 'sounds/key.mp3'
        };
        
        this.sounds = {};
        this.enabled = localStorage.getItem('soundEffects') !== 'false';
        
        // Try to load sounds
        this.loadSounds();
        
        // Add event listener for sound settings
        const soundCheckbox = document.getElementById('soundEffects');
        if (soundCheckbox) {
            soundCheckbox.checked = this.enabled;
            soundCheckbox.addEventListener('change', () => {
                this.setEnabled(soundCheckbox.checked);
            });
        }
    }
    
    loadSounds() {
        for (const [name, path] of Object.entries(this.soundFiles)) {
            try {
                const audio = new Audio(path);
                
                // Add event listener to log issues
                audio.addEventListener('error', (e) => {
                    console.warn(`Error loading sound "${name}":`, e);
                });
                
                // Preload the audio
                audio.load();
                
                this.sounds[name] = audio;
            } catch (err) {
                console.warn(`Could not create sound "${name}":`, err);
            }
        }
    }
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        try {
            // Clone the audio to allow multiple sounds to play simultaneously
            const sound = this.sounds[soundName].cloneNode();
            
            // Play the sound
            sound.play().catch(err => {
                console.warn(`Sound play error (${soundName}):`, err);
            });
        } catch (err) {
            console.warn(`Sound system error (${soundName}):`, err);
        }
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem('soundEffects', enabled);
    }
    
    testSounds() {
        Object.keys(this.soundFiles).forEach(soundName => {
            this.play(soundName);
        });
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
    constructor() {
        console.log('Initializing game...');
        this.settings = new Settings();
        this.sounds = new SoundManager();
        this.statistics = new Statistics();
        
        // Game state
        this.currentWord = '';
        this.currentCategory = '';
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.gameMode = '';
        this.timerInterval = null;
        this.startTime = 0;
        this.hangman = null;
        this.handleKeyDown = null;
        
        // Get UI elements
        this.initializeUI();
        
        // Enable or disable sound effects based on settings
        this.sounds.setEnabled(this.settings.getSetting('soundEffects'));
        
        // Apply dark/light mode from settings
        this.applyDarkMode();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Game initialized');
    }
    
    /**
     * Apply dark or light mode from settings
     */
    applyDarkMode() {
        const darkModeEnabled = this.settings.getSetting('darkMode');
        console.log('Applying dark mode:', darkModeEnabled);
        
        // Set the data-theme attribute on the document element
        document.documentElement.setAttribute('data-theme', darkModeEnabled ? 'dark' : 'light');
        
        // Update the checkbox in settings modal
        const darkModeCheckbox = document.getElementById('darkMode');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = darkModeEnabled;
        }
    }

    /**
     * Initialize UI elements
     */
    initializeUI() {
        console.log('Initializing UI elements');
        
        // Get main UI elements
        this.wordDisplay = document.querySelector('.word-display');
        this.keyboard = document.querySelector('.armenian-keyboard');
        this.timerDisplay = document.querySelector('.timer');
        this.messageDisplay = document.querySelector('.message');
        
        // Get main screens
        this.categorySelection = document.getElementById('category-selection');
        this.gameArea = document.getElementById('game-area');
        this.homeScreen = document.getElementById('home-screen');
        
        // Initially show home screen, hide others
        this.showScreen('home-screen');
        
        // Initialize hangman SVG element
        this.initializeHangman();
    }
    
    /**
     * Display a specific screen and hide others
     */
    showScreen(screenId) {
        // List of all screen IDs
        const screens = ['home-screen', 'category-selection', 'game-area'];
        
        // Hide all screens
        screens.forEach(id => {
            const screen = document.getElementById(id);
            if (screen) {
                screen.style.display = 'none';
            }
        });
        
        // Show the requested screen
        const screenToShow = document.getElementById(screenId);
        if (screenToShow) {
            screenToShow.style.display = 'block';
            console.log(`Showing screen: ${screenId}`);
        } else {
            console.error(`Screen not found: ${screenId}`);
        }
    }
    
    /**
     * Initialize the Hangman drawing
     */
    initializeHangman() {
        const hangmanSvg = document.querySelector('.hangman-svg');
        if (hangmanSvg) {
            this.hangman = new Hangman(hangmanSvg);
            this.hangman.clear();
            this.hangman.drawPart(0); // Draw the gallows
            console.log('Hangman drawing initialized');
        } else {
            console.error('Hangman SVG element not found');
        }
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
        const testSoundsBtn = document.getElementById('test-sounds');
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
    }
    
    /**
     * Set up keyboard event listeners
     */
    setupKeyboardEventListeners() {
        console.log('Setting up keyboard event listeners');
        
        // First, ensure all keyboard buttons are reset
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        const keyButtons = document.querySelectorAll('.key-btn');
        if (keyButtons.length === 0) {
            console.error('No keyboard buttons found');
            return;
        }
        
        // Remove existing listeners by cloning elements
        keyButtons.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
        });
        
        // Add new click listeners to all keyboard buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.onclick = () => {
                if (!btn.disabled) {
                    const letter = btn.getAttribute('data-letter');
                    this.makeGuess(letter);
                }
            };
        });
        
        // Add physical keyboard support
        document.removeEventListener('keydown', this.handleKeyDown);
        this.handleKeyDown = (event) => {
            const key = event.key.toLowerCase();
            const button = document.querySelector(`.key-btn[data-letter="${key}"]`);
            if (button && !button.disabled && this.gameArea.style.display !== 'none') {
                this.makeGuess(key);
            }
        };
        document.addEventListener('keydown', this.handleKeyDown);
    }
    
    /**
     * Reset game state completely
     */
    resetGameState() {
        console.log('Resetting game state');
        
        this.currentWord = '';
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
            this.messageDisplay.className = 'message';
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
        console.log('Getting a new word and restarting game');
        
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
                this.showHomeScreen();
                return;
            }
            
            // Set up the daily challenge
            this.currentWord = getDailyWord();
            console.log('Starting daily challenge with word:', this.currentWord);
            
            // Hide restart button in daily challenge
            const restartBtn = document.getElementById('restart-game');
            if (restartBtn) restartBtn.style.display = 'none';
            
            // Show game area
            this.showScreen('game-area');
            
            // Mark daily challenge as played for today
            markDailyChallengeAsPlayed();
            
            // Start the game
            this.startNewGame();
        }
    }

    /**
     * Select a category and start a game
     */
    selectCategory(category) {
        console.log('Selecting category:', category);
        this.currentCategory = category;
        
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
        
        // Show restart button for regular mode
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.style.display = 'block';
        }
        
        // Start the game with the new word
        this.startNewGame();
    }

    /**
     * Start a new game with current word
     */
    startNewGame() {
        console.log('Starting new game with word:', this.currentWord);
        
        // Validate that we have a word
        if (!this.currentWord || this.currentWord.length === 0) {
            console.error('Cannot start game without a valid word');
            alert('Error starting game. Please try again.');
            this.showHomeScreen();
            return;
        }
        
        // Reset game state
        this.guessedLetters.clear();
        this.remainingAttempts = 6;
        this.startTime = Date.now();
        
        // Make sure game area is visible
        this.showScreen('game-area');
        
        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        // Clear message
        if (this.messageDisplay) {
            this.messageDisplay.textContent = '';
            this.messageDisplay.className = 'message';
            this.messageDisplay.style.display = 'none';
        }
        
        // Reset hangman if initialized
        if (this.hangman) {
            this.hangman.clear();
            this.hangman.drawPart(0); // Draw the gallows
        } else {
            // Try to initialize hangman if not already done
            this.initializeHangman();
        }
        
        // Clear word display
        if (this.wordDisplay) {
            this.wordDisplay.innerHTML = '';
        }
        
        // Refresh keyboard event listeners
        this.setupKeyboardEventListeners();
        
        // Start the timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        this.startTime = Date.now();
        this.updateTimer();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        
        // Update the display
        this.updateDisplay();
    }
    
    /**
     * Update the timer display
     */
    updateTimer() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    /**
     * Process a letter guess
     */
    makeGuess(letter) {
        console.log('Guessing letter:', letter);
        
        if (this.guessedLetters.has(letter)) {
            console.log('Letter already guessed');
            return;
        }
        
        if (this.remainingAttempts <= 0) {
            console.log('No remaining attempts');
            return;
        }
        
        // Play sound
        this.sounds.play('key');
        
        // Add to guessed letters
        this.guessedLetters.add(letter);
        
        // Find keyboard button
        const letterBtn = document.querySelector(`.key-btn[data-letter="${letter}"]`);
        
        // Check if letter is in the word
        if (this.currentWord.includes(letter)) {
            // Correct guess
            console.log('Correct guess');
            this.sounds.play('correct');
            if (letterBtn) letterBtn.classList.add('correct');
        } else {
            // Wrong guess
            console.log('Wrong guess');
            this.sounds.play('wrong');
            if (letterBtn) letterBtn.classList.add('wrong');
            this.remainingAttempts--;
            
            // Draw next hangman part
            if (this.hangman) {
                this.hangman.drawPart(6 - this.remainingAttempts);
            }
        }
        
        // Disable the button
        if (letterBtn) letterBtn.disabled = true;
        
        // Update display
        this.updateDisplay();
        
        // Check win/loss conditions
        if (this.checkWin()) {
            this.endGame(true);
        } else if (this.remainingAttempts <= 0) {
            this.endGame(false);
        }
    }

    /**
     * Check if player has won
     */
    checkWin() {
        return [...this.currentWord].every(letter => this.guessedLetters.has(letter));
    }

    /**
     * Update the game display
     */
    updateDisplay() {
        console.log('Updating display');
        
        // Update word display with underscores or guessed letters
        if (this.wordDisplay && this.currentWord) {
            this.wordDisplay.innerHTML = [...this.currentWord]
                .map(letter => `<span>${this.guessedLetters.has(letter) ? letter : '_'}</span>`)
                .join('');
        }
    }

    /**
     * End the game
     */
    endGame(won) {
        console.log('Ending game, won:', won);
        
        // Display message
        const message = won ? 'Շնորհաւո՜ր, յաղթեցիք' : `Պարտուեցաք։ Բառը՝ ${this.currentWord}`;
        
        if (this.messageDisplay) {
            this.messageDisplay.textContent = message;
            this.messageDisplay.style.display = 'block';
            this.messageDisplay.className = `message ${won ? 'win' : 'lose'}`;
        }
        
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Calculate time elapsed
        const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Play sound
        this.sounds.play(won ? 'win' : 'lose');
        
        // Show all letters in the word
        if (this.wordDisplay) {
            this.wordDisplay.innerHTML = [...this.currentWord]
                .map(letter => `<span>${letter}</span>`)
                .join('');
        }
        
        // Disable all keyboard buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Update statistics
        this.statistics.updateStats(won, timeElapsed);
        
        // Show restart button if in regular mode
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            if (this.gameMode === 'regular') {
                restartBtn.style.display = 'block';
            } else {
                restartBtn.style.display = 'none';
            }
        }
        
        // Show alert with game results
        setTimeout(() => {
            alert(`${message}\nԽաղացած ժամանակ: ${timeElapsed} վայրկեան`);
        }, 500);
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing game...');
    
    try {
        // Create and initialize the game
        window.gameInstance = new Game();
        
        // Force the game to show the home screen initially
        if (window.gameInstance) {
            window.gameInstance.showHomeScreen();
            console.log('Game instance created successfully and home screen shown');
        }
    } catch (error) {
        console.error('Error initializing game:', error);
        alert('An error occurred initializing the game. Please refresh the page and try again.');
    }
});
