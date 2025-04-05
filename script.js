/**
 * Simplified Hangman Game
 * A complete rewrite focusing on reliability and simplicity
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the game and initialize
    const game = new HangmanGame();
    game.initialize();
});

/**
 * Main Game Class
 * Controls the game flow and state
 */
class HangmanGame {
    constructor() {
        // Initialize core components
        this.soundManager = new SoundManager();
        this.settingsManager = new Settings();
        this.statisticsManager = new Statistics();
        
        // Game state
        this.currentWord = '';
        this.currentCategory = '';
        this.gameMode = '';
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.gameActive = false;
        
        // UI Elements - cached for performance
        this.wordDisplay = document.querySelector('.word-display');
        this.messageElement = document.querySelector('.message');
        this.timerElement = document.querySelector('.timer');
        
        // Create the hangman drawer
        const hangmanSvg = document.getElementById('hangman-svg');
        if (hangmanSvg) {
            this.hangman = new HangmanDrawer(hangmanSvg);
            console.log('Hangman SVG element found by ID');
        } else {
            console.error('Hangman SVG element not found by ID');
        }
    }
    
    /**
     * Initialize the game and set up all event listeners
     */
    initialize() {
        console.log('Initializing game...');
        
        // Apply settings from local storage
        this.applySettings();
        
        // Set up all event handlers
        this.setupEventListeners();
        
        // Show the home screen initially
        this.showScreen('home-screen');
        
        console.log('Game initialized successfully');
    }
    
    /**
     * Apply saved settings
     */
    applySettings() {
        // Apply dark mode if enabled
        if (this.settingsManager.getSetting('darkMode')) {
            document.body.classList.add('dark-mode');
        }
        
        // Apply sound settings
        this.soundManager.setEnabled(this.settingsManager.getSetting('soundEffects'));
    }
    
    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // === HOME SCREEN BUTTONS ===
        
        // Regular game button (shows categories)
        const regularModeBtn = document.querySelector('.mode-btn[data-mode="regular"]');
        if (regularModeBtn) {
            regularModeBtn.onclick = () => {
                this.soundManager.play('click');
                this.showScreen('category-selection');
            };
        }
        
        // Daily challenge button
        const dailyModeBtn = document.querySelector('.mode-btn[data-mode="daily"]');
        if (dailyModeBtn) {
            dailyModeBtn.onclick = () => {
                this.soundManager.play('click');
                this.startDailyChallenge();
            };
        }
        
        // === CATEGORY BUTTONS ===
        
        // Category selection buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(btn => {
            btn.onclick = () => {
                const category = btn.getAttribute('data-category');
                if (category) {
                    this.soundManager.play('select');
                    this.startGame(category);
                }
            };
        });
        
        // === GAME SCREEN BUTTONS ===
        
        // Back button (from game to home)
        const backBtn = document.getElementById('back-from-game');
        if (backBtn) {
            backBtn.onclick = () => {
                this.soundManager.play('click');
                this.showScreen('home-screen');
            };
        }
        
        // Restart button (in game)
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.onclick = () => {
                this.soundManager.play('click');
                this.restartGame();
            };
        }
        
        // Bottom restart button (new)
        const bottomRestartBtn = document.getElementById('bottom-restart-game');
        if (bottomRestartBtn) {
            bottomRestartBtn.onclick = () => {
                this.soundManager.play('click');
                this.restartGame();
            };
        }
        
        // === HEADER BUTTONS ===
        
        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => {
                this.soundManager.play('click');
                document.getElementById('settingsModal').style.display = 'block';
            };
        }
        
        // Stats button
        const statsBtn = document.querySelector('.stats-btn');
        if (statsBtn) {
            statsBtn.onclick = () => {
                this.soundManager.play('click');
                this.statisticsManager.updateDisplay();
                document.getElementById('statsModal').style.display = 'block';
            };
        }
        
        // Help button
        const helpBtn = document.querySelector('.help-btn');
        if (helpBtn) {
            helpBtn.onclick = () => {
                this.soundManager.play('click');
                document.getElementById('helpModal').style.display = 'block';
            };
        }
        
        // === MODAL HANDLING ===
        
        // Close buttons for all modals
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(btn => {
            btn.onclick = () => {
                this.soundManager.play('click');
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            };
        });
        
        // Click outside modal to close
        window.onclick = (event) => {
            if (event.target.classList.contains('modal')) {
                this.soundManager.play('click');
                event.target.style.display = 'none';
            }
        };
        
        // === SETTINGS CONTROLS ===
        
        // Dark mode toggle
        const darkModeCheckbox = document.getElementById('darkMode');
        if (darkModeCheckbox) {
            darkModeCheckbox.checked = this.settingsManager.getSetting('darkMode');
            
            darkModeCheckbox.onchange = () => {
                this.soundManager.play('click');
                this.settingsManager.updateSetting('darkMode', darkModeCheckbox.checked);
                
                // Apply dark mode immediately
                if (darkModeCheckbox.checked) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            };
        }
        
        // Sound effects toggle
        const soundEffectsCheckbox = document.getElementById('soundEffects');
        if (soundEffectsCheckbox) {
            soundEffectsCheckbox.checked = this.settingsManager.getSetting('soundEffects');
            
            soundEffectsCheckbox.onchange = () => {
                // Play sound before potentially disabling
                if (soundEffectsCheckbox.checked) {
                    this.soundManager.play('click');
                }
                
                this.settingsManager.updateSetting('soundEffects', soundEffectsCheckbox.checked);
                this.soundManager.setEnabled(soundEffectsCheckbox.checked);
            };
        }
        
        // Reset statistics button
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.onclick = () => {
                this.soundManager.play('click');
                
                // Confirm before resetting
                if (confirm('Դուք վստա՞հ էք, որ կ՚ուզէք զրոյացնել ձեր վիճակագրութիւնը:')) {
                    this.statisticsManager.resetStats();
                }
            };
        }
        
        // === KEYBOARD HANDLING ===
        
        // On-screen keyboard
        this.setupKeyboard();
        
        // Physical keyboard
        document.addEventListener('keydown', (event) => {
            if (!this.gameActive) return;
            
            const key = event.key.toLowerCase();
            // Support both Latin and Armenian letters
            if (/^[a-zաբգդեզէըթժիլխծկհձղճմյնշոչպջռսվտրցւփքօֆև]$/i.test(key)) {
                this.soundManager.play('key');
                this.makeGuess(key);
            }
        });
    }
    
    /**
     * Set up on-screen keyboard
     */
    setupKeyboard() {
        const keyboardButtons = document.querySelectorAll('.key-btn');
        keyboardButtons.forEach(btn => {
            btn.onclick = () => {
                if (!this.gameActive) return;
                
                const letter = btn.getAttribute('data-letter') || btn.textContent.trim().toLowerCase();
                if (letter) {
                    this.soundManager.play('key');
                    this.makeGuess(letter);
                }
            };
        });
    }
    
    /**
     * Show a specific screen and hide others
     */
    showScreen(screenId) {
        // Hide all screens
        document.getElementById('home-screen').style.display = 'none';
        document.getElementById('category-selection').style.display = 'none';
        document.getElementById('game-area').style.display = 'none';
        
        // Show the requested screen
        document.getElementById(screenId).style.display = 'block';
        
        // Reset game state when leaving game screen
        if (screenId !== 'game-area') {
            this.gameActive = false;
        }
    }
    
    /**
     * Start a game with the selected category
     */
    startGame(category) {
        console.log('Starting game with category:', category);
        
        // Set game settings
        this.currentCategory = category;
        this.gameMode = 'regular';
        
        // Get a random word from the selected category
        this.currentWord = getRandomWord(category);
        
        // Make sure we have a valid word
        if (!this.currentWord) {
            console.error('Failed to get word for category:', category);
            this.currentWord = getRandomWord(); // Fallback to any word
        }
        
        // Show the game area
        this.showScreen('game-area');
        
        // Initialize the new game
        this.startNewRound();
    }
    
    /**
     * Start the daily challenge mode
     */
    startDailyChallenge() {
        // Check if already played today
        if (hasDailyChallengeBeenPlayed()) {
            alert('You have already played today\'s challenge!');
            return;
        }
        
        // Set game mode and mark as played
        this.gameMode = 'daily';
        markDailyChallengeAsPlayed();
        
        // Get the daily word
        this.currentWord = getDailyWord();
        
        // Make sure we have a valid word
        if (!this.currentWord) {
            console.error('Failed to get daily word');
            this.currentWord = getRandomWord(); // Fallback to any word
        }
        
        // Show the game area
        this.showScreen('game-area');
        
        // Initialize the new game
        this.startNewRound();
    }
    
    /**
     * Restart the game with a new word from the same category
     */
    restartGame() {
        // Get a new word from the same category
        this.currentWord = getRandomWord(this.currentCategory);
        
        // Initialize the new game
        this.startNewRound();
    }
    
    /**
     * Start a new round with the current word
     */
    startNewRound() {
        // Reset game state
        this.resetGameState();
        
        // Update word display with blanks
        this.updateWordDisplay();
        
        // No welcome message to avoid confusion
        
        // Play start sound
        this.soundManager.play('start');
        
        // Set game as active
        this.gameActive = true;
    }
    
    /**
     * Reset the game state for a new round
     */
    resetGameState() {
        // Reset guesses and attempts
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        
        // Reset UI
        if (this.messageElement) {
            this.messageElement.textContent = '';
            this.messageElement.className = 'message';
        }
        
        // Reset hangman drawing
        if (this.hangman) {
            this.hangman.clear();
            this.hangman.drawGallows();
            console.log('Hangman gallows drawn');
        } else {
            console.error('Hangman drawer not initialized');
        }
        
        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.classList.remove('correct', 'wrong');
            btn.disabled = false;
        });
    }
    
    /**
     * Process a letter guess
     */
    makeGuess(letter) {
        letter = letter.toLowerCase();
        
        // Ignore if game not active or letter already guessed
        if (!this.gameActive || this.guessedLetters.has(letter)) {
            return;
        }
        
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
            this.soundManager.play('correct');
            if (button) {
                button.classList.add('correct');
            }
            
            // Update the word display
            this.updateWordDisplay();
            
            // Check for win
            const allLettersGuessed = [...this.currentWord.toLowerCase()].every(
                char => char === ' ' || this.guessedLetters.has(char)
            );
            
            if (allLettersGuessed) {
                this.endGame(true);
            }
        } else {
            // Wrong guess
            this.soundManager.play('wrong');
            if (button) {
                button.classList.add('wrong');
            }
            
            // Reduce attempts and update hangman
            this.remainingAttempts--;
            if (this.hangman) {
                this.hangman.drawNextPart();
            }
            
            // Check for loss
            if (this.remainingAttempts <= 0) {
                this.endGame(false);
            }
        }
    }
    
    /**
     * Update the word display with guessed and unguessed letters
     */
    updateWordDisplay() {
        if (!this.wordDisplay || !this.currentWord) {
            return;
        }
        
        // Clear previous content
        this.wordDisplay.innerHTML = '';
        
        // Create letter elements
        this.currentWord.split('').forEach(letter => {
            const letterElement = document.createElement('span');
            letterElement.className = 'letter';
            
            // Show letter if guessed or if it's a space
            if (this.guessedLetters.has(letter.toLowerCase()) || letter === ' ') {
                letterElement.textContent = letter;
            } else {
                letterElement.textContent = '_';
            }
            
            this.wordDisplay.appendChild(letterElement);
        });
    }
    
    /**
     * End the game (win or lose)
     */
    endGame(result) {
        // Game is no longer active
        this.gameActive = false;
        
        // Disable all keyboard buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Play appropriate sound
        this.soundManager.play(result ? 'win' : 'lose');
        
        // Show the complete word
        if (this.wordDisplay) {
            this.wordDisplay.textContent = this.currentWord;
        }
        
        // Update the message
        const message = result ? 'Շնորհավոր, դուք հաղթեցիք!' : 'Դուք պարտուեցաք!';
        if (this.messageElement) {
            this.messageElement.textContent = message;
            this.messageElement.className = result ? 'message win' : 'message lose';
        }
        
        // Update statistics
        this.statisticsManager.updateStats(result);
        
        // Show alert with result
        setTimeout(() => {
            alert(message);
        }, 500);
    }
}

/**
 * Sound Manager
 * Handles all game sound effects using Web Audio API
 */
class SoundManager {
    constructor() {
        // Get enabled state from settings
        this.enabled = localStorage.getItem('soundEffects') !== 'false';
        
        // Try to initialize audio context
        this.audioContext = null;
        this.initializeAudio();
        
        // Create a click handler to initialize audio (needed for browsers that require user interaction)
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.initializeAudio();
            } else if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
        }, { once: true });
    }
    
    /**
     * Initialize the audio context
     */
    initializeAudio() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                
                // Try to resume if suspended
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }
        } catch (error) {
            console.error('Failed to initialize audio context:', error);
        }
    }
    
    /**
     * Play a sound effect
     */
    play(type) {
        if (!this.enabled || !this.audioContext) return;
        
        try {
            // Make sure context is running
            if (this.audioContext.state !== 'running') {
                this.audioContext.resume();
            }
            
            // Create oscillator and gain node
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Connect nodes
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configure sound based on type
            let frequency = 500;
            let duration = 0.1;
            let volume = 0.3;
            
            switch (type) {
                case 'click':
                    frequency = 800;
                    duration = 0.1;
                    volume = 0.3;
                    break;
                case 'select':
                    frequency = 1000;
                    duration = 0.15;
                    volume = 0.3;
                    break;
                case 'key':
                    frequency = 500;
                    duration = 0.05;
                    volume = 0.2;
                    break;
                case 'correct':
                    frequency = 1200;
                    duration = 0.2;
                    volume = 0.3;
                    break;
                case 'wrong':
                    frequency = 300;
                    duration = 0.2;
                    volume = 0.3;
                    break;
                case 'win':
                    frequency = 800;
                    duration = 0.5;
                    volume = 0.4;
                    break;
                case 'lose':
                    frequency = 200;
                    duration = 0.5;
                    volume = 0.4;
                    break;
                case 'start':
                    frequency = 700;
                    duration = 0.3;
                    volume = 0.3;
                    break;
            }
            
            // Set oscillator properties
            oscillator.type = 'sine';
            oscillator.frequency.value = frequency;
            gainNode.gain.value = volume;
            
            // Play the sound
            const now = this.audioContext.currentTime;
            oscillator.start(now);
            oscillator.stop(now + duration);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }
    
    /**
     * Set whether sounds are enabled
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

/**
 * Settings Manager
 * Handles saving and loading game settings
 */
class Settings {
    constructor() {
        // Load settings from local storage
        const savedSettings = localStorage.getItem('gameSettings');
        
        // Use default settings if none found
        this.settings = savedSettings ? JSON.parse(savedSettings) : {
            darkMode: false,
            soundEffects: true
        };
    }
    
    /**
     * Get a setting value
     */
    getSetting(key) {
        return this.settings[key];
    }
    
    /**
     * Update a setting
     */
    updateSetting(key, value) {
        this.settings[key] = value;
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
}

/**
 * Statistics Manager
 * Handles tracking and displaying game statistics
 */
class Statistics {
    constructor() {
        // Try to load saved stats
        const savedStats = localStorage.getItem('gameStats');
        
        // Use default stats if none found
        this.stats = savedStats ? JSON.parse(savedStats) : {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
        };
    }
    
    /**
     * Update stats at the end of a game
     */
    updateStats(won) {
        // Update stats based on game result
        this.stats.gamesPlayed++;
        
        if (won) {
            this.stats.gamesWon++;
            this.stats.currentStreak++;
            
            // Update max streak if needed
            if (this.stats.currentStreak > this.stats.maxStreak) {
                this.stats.maxStreak = this.stats.currentStreak;
            }
        } else {
            this.stats.currentStreak = 0;
        }
        
        // Save stats to local storage
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
        
        // Update the display
        this.updateDisplay();
    }
    
    /**
     * Update the stats display
     */
    updateDisplay() {
        // Calculate win percentage
        const winPercentage = this.stats.gamesPlayed > 0 
            ? Math.round((this.stats.gamesWon / this.stats.gamesPlayed) * 100) 
            : 0;
        
        // Update UI elements
        this.updateElement('gamesPlayed', this.stats.gamesPlayed);
        this.updateElement('gamesWon', this.stats.gamesWon);
        this.updateElement('winPercentage', `${winPercentage}%`);
        this.updateElement('currentStreak', this.stats.currentStreak);
        this.updateElement('maxStreak', this.stats.maxStreak);
    }
    
    /**
     * Helper method to update an element's text content
     */
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            gamesPlayed: 0,
            gamesWon: 0,
            currentStreak: 0,
            maxStreak: 0
        };
        
        // Save stats to local storage
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
        
        // Update the display
        this.updateDisplay();
    }
}

/**
 * Hangman Drawer
 * Handles drawing the hangman SVG
 */
class HangmanDrawer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.currentPart = 0;
        this.strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim() || '#000000';
        this.strokeWidth = 3;
        console.log('HangmanDrawer initialized with SVG element:', svgElement);
    }
    
    /**
     * Clear the SVG
     */
    clear() {
        if (!this.svg) {
            console.error('SVG element not found in clear method');
            return;
        }
        
        while (this.svg.firstChild) {
            this.svg.removeChild(this.svg.firstChild);
        }
        
        this.currentPart = 0;
        console.log('SVG cleared');
    }
    
    /**
     * Draw the gallows
     */
    drawGallows() {
        if (!this.svg) {
            console.error('SVG element not found in drawGallows method');
            return;
        }
        
        // Base
        this.createLine(20, 280, 180, 280);
        
        // Post
        this.createLine(60, 280, 60, 50);
        
        // Top
        this.createLine(60, 50, 160, 50);
        
        // Rope
        this.createLine(160, 50, 160, 80);
        
        console.log('Gallows drawn');
    }
    
    /**
     * Draw the next part of the hangman
     */
    drawNextPart() {
        if (!this.svg) {
            console.error('SVG element not found in drawNextPart method');
            return;
        }
        
        this.currentPart++;
        
        switch (this.currentPart) {
            case 1: // Head
                this.createCircle(160, 100, 20);
                break;
            case 2: // Body
                this.createLine(160, 120, 160, 190);
                break;
            case 3: // Left arm
                this.createLine(160, 140, 120, 160);
                break;
            case 4: // Right arm
                this.createLine(160, 140, 200, 160);
                break;
            case 5: // Left leg
                this.createLine(160, 190, 130, 240);
                break;
            case 6: // Right leg
                this.createLine(160, 190, 190, 240);
                break;
            default:
                console.log('All parts already drawn');
                break;
        }
    }
    
    /**
     * Helper method to create a line
     */
    createLine(x1, y1, x2, y2) {
        if (!this.svg) {
            console.error('SVG element not found in createLine method');
            return;
        }
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', this.strokeColor);
        line.setAttribute('stroke-width', this.strokeWidth);
        line.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(line);
    }
    
    /**
     * Helper method to create a circle
     */
    createCircle(cx, cy, r) {
        if (!this.svg) {
            console.error('SVG element not found in createCircle method');
            return;
        }
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('stroke', this.strokeColor);
        circle.setAttribute('stroke-width', this.strokeWidth);
        circle.setAttribute('fill', 'none');
        this.svg.appendChild(circle);
    }
}
