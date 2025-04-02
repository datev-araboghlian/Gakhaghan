import { wordData, getDailyWord, hasDailyChallengeBeenPlayed, markDailyChallengeAsPlayed, getRandomWord } from './data.js';

// Sound manager for game sound effects
class SoundManager {
    constructor() {
        this.sounds = {
            correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-click-3154.mp3'),
            wrong: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-software-interface-remove-2576.mp3'),
            win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
            lose: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3'),
            key: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-keyboard-key-press-1115.mp3')
        };
        
        this.enabled = true;
    }
    
    play(soundName) {
        if (!this.enabled || !this.sounds[soundName]) return;
        
        // Stop and reset the sound before playing
        this.sounds[soundName].pause();
        this.sounds[soundName].currentTime = 0;
        
        // Play the sound
        this.sounds[soundName].play().catch(err => {
            console.error('Error playing sound:', err);
        });
    }
    
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// Settings class for game settings
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

class Game {
    constructor() {
        console.log('Initializing game...');
        this.settings = new Settings();
        this.sounds = new SoundManager();
        
        this.currentWord = '';
        this.currentCategory = '';
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.gameMode = '';
        this.timerInterval = null;
        this.startTime = 0;
        this.hangman = null;
        
        // Enable or disable sound effects based on settings
        this.sounds.setEnabled(this.settings.getSetting('soundEffects'));
        
        // Apply dark/light mode from settings
        this.applyDarkMode();
        
        // Initialize the game components
        this.initializeUI();
        this.setupEventListeners();
        
        // Initialize statistics
        this.statistics = new Statistics();
        
        console.log('Game initialized');
    }
    
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

    initializeUI() {
        console.log('Initializing UI elements');
        
        // Get main UI elements
        this.wordDisplay = document.querySelector('.word-display');
        this.keyboard = document.querySelector('.armenian-keyboard');
        this.timerDisplay = document.querySelector('.timer');
        this.messageDisplay = document.querySelector('.message');
        this.categorySelection = document.getElementById('category-selection');
        this.gameArea = document.getElementById('game-area');
        this.homeScreen = document.getElementById('home-screen');
        
        // Initially hide game area and category selection
        if (this.gameArea) {
            this.gameArea.style.display = 'none';
        } else {
            console.error('Game area element not found');
        }
        
        if (this.categorySelection) {
            this.categorySelection.style.display = 'none';
        } else {
            console.error('Category selection element not found');
        }
        
        // Show home screen
        if (this.homeScreen) {
            this.homeScreen.style.display = 'block';
        } else {
            console.error('Home screen element not found');
        }
        
        // Initialize hangman SVG element
        const hangmanSvg = document.querySelector('.hangman-svg');
        if (hangmanSvg) {
            this.hangman = new Hangman(hangmanSvg);
            console.log('Hangman initialized');
        } else {
            console.error('Hangman SVG element not found');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        
        // Mode buttons (regular, daily challenge)
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.onclick = () => {
                const mode = btn.getAttribute('data-mode');
                console.log('Mode clicked:', mode);
                
                // Reset game state
                this.resetGameState();
                
                // Set and initialize the selected game mode
                this.setGameMode(mode);
            };
        });

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.onclick = () => {
                const category = btn.getAttribute('data-category');
                console.log('Category clicked:', category);
                
                // Select the category and start the game
                this.selectCategory(category);
            };
        });

        // Keyboard buttons - set up in a separate method for easier reinitialization
        this.setupKeyboardEventListeners();

        // Restart game button
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.onclick = () => {
                console.log('Restart game clicked');
                // Get a new word and restart the game
                this.getNewWordAndRestart();
            };
        } else {
            console.error('Restart button not found');
        }

        // Back buttons
        document.querySelectorAll('.back-btn').forEach(backBtn => {
            backBtn.onclick = () => {
                if (backBtn.id === 'back-to-home') {
                    // Go back from category selection to home
                    this.showHomeScreen();
                } else if (backBtn.id === 'back-from-game') {
                    // Go back from game to home
                    this.showHomeScreen();
                    
                    // Reset game state when going back
                    this.resetGameState();
                }
            };
        });

        // Settings button
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.onclick = () => {
                const modal = document.getElementById('settingsModal');
                if (modal) modal.style.display = 'block';
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
        document.querySelectorAll('.close').forEach(closeBtn => {
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
    
    // Method to completely reset game state
    resetGameState() {
        console.log('Resetting game state');
        
        this.currentWord = '';
        this.currentCategory = '';
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
        }
        
        // Reset hangman if initialized
        if (this.hangman) {
            this.hangman.clear();
            this.hangman.drawPart(0); // Draw the gallows
        }
    }
    
    // Method to show home screen and hide other screens
    showHomeScreen() {
        console.log('Showing home screen');
        
        if (this.homeScreen) this.homeScreen.style.display = 'block';
        if (this.categorySelection) this.categorySelection.style.display = 'none';
        if (this.gameArea) this.gameArea.style.display = 'none';
    }
    
    // Set up keyboard event listeners
    setupKeyboardEventListeners() {
        console.log('Setting up keyboard event listeners');
        
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
        document.addEventListener('keydown', (event) => {
            const key = event.key.toLowerCase();
            const button = document.querySelector(`.key-btn[data-letter="${key}"]`);
            if (button && !button.disabled) {
                this.makeGuess(key);
            }
        });
    }
    
    // Method to get a new word and restart the game
    getNewWordAndRestart() {
        console.log('Getting a new word and restarting game');
        
        // Reset game state first
        this.resetGameState();
        
        // Get a new word based on the current mode and category
        if (this.gameMode === 'regular') {
            this.currentWord = getRandomWord(this.currentCategory || null);
            console.log('New word for regular mode:', this.currentWord);
        } else if (this.gameMode === 'daily') {
            this.currentWord = getDailyWord();
            console.log('Daily challenge word:', this.currentWord);
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

    // Set the game mode (regular or daily)
    setGameMode(mode) {
        console.log('Setting game mode to:', mode);
        this.gameMode = mode;
        
        // Hide all screens first
        if (this.homeScreen) this.homeScreen.style.display = 'none';
        if (this.categorySelection) this.categorySelection.style.display = 'none';
        if (this.gameArea) this.gameArea.style.display = 'none';
        
        if (mode === 'regular') {
            // For regular mode, show category selection
            if (this.categorySelection) {
                console.log('Showing category selection for regular mode');
                this.categorySelection.style.display = 'block';
                
                // Add back button to category selection
                const backBtn = document.getElementById('back-to-home');
                if (backBtn) backBtn.style.display = 'block';
                
                // Pre-initialize hangman to ensure it's ready when a category is selected
                this.initializeHangman();
            } else {
                console.error('Category selection element not found for regular mode');
            }
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
            if (this.gameArea) {
                console.log('Showing game area for daily challenge');
                this.gameArea.style.display = 'block';
                
                // Initialize hangman if not already done
                this.initializeHangman();
                
                // Mark daily challenge as played for today
                markDailyChallengeAsPlayed();
                
                // Start the game
                this.startNewGame();
            } else {
                console.error('Game area element not found for daily challenge');
            }
        }
    }

    // Helper method to ensure hangman is initialized
    initializeHangman() {
        if (!this.hangman) {
            const hangmanSvg = document.querySelector('.hangman-svg');
            if (hangmanSvg) {
                console.log('Initializing hangman');
                this.hangman = new Hangman(hangmanSvg);
                this.hangman.drawPart(0); // Draw the gallows
            } else {
                console.error('Hangman SVG element not found for initialization');
            }
        } else {
            // Reset existing hangman
            this.hangman.clear();
            this.hangman.drawPart(0);
        }
    }

    // Select a category and start a game
    selectCategory(category) {
        console.log('Selecting category:', category);
        this.currentCategory = category;
        
        // Hide category selection
        if (this.categorySelection) {
            this.categorySelection.style.display = 'none';
        }
        
        // Directly select a random word from the category
        this.currentWord = getRandomWord(category);
        console.log('Selected random word from category:', this.currentWord);
        
        // Ensure we have a valid word
        if (!this.currentWord || this.currentWord.length === 0) {
            console.error('Failed to get a valid word from category. Getting a fallback word.');
            // Fallback to any random word if no word was returned
            this.currentWord = getRandomWord(null);
            console.log('Fallback word:', this.currentWord);
        }
        
        // Show restart button for regular mode
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn && this.gameMode === 'regular') {
            restartBtn.style.display = 'block';
        }
        
        // Show game area 
        if (this.gameArea) {
            console.log('Showing game area');
            this.gameArea.style.display = 'block';
        } else {
            console.error('Game area element not found');
        }
        
        // Initialize hangman if not already done
        this.initializeHangman();
        
        // Start the game
        this.startNewGame();
    }

    // Start a new game with current word
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
        if (this.gameArea) {
            this.gameArea.style.display = 'block';
        } else {
            console.error('Game area element not found');
        }
        
        // Initialize or reset hangman
        this.initializeHangman();
        
        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        // Clear message
        if (this.messageDisplay) {
            this.messageDisplay.textContent = '';
            this.messageDisplay.className = 'message';
        }
        
        // Reset hangman if initialized
        if (this.hangman) {
            this.hangman.clear();
            this.hangman.drawPart(0); // Draw the gallows
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
    
    // Update the timer display
    updateTimer() {
        const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        
        if (this.timerDisplay) {
            this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    // Process a letter guess
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

    // Check if player has won
    checkWin() {
        return [...this.currentWord].every(letter => this.guessedLetters.has(letter));
    }

    // Update the game display
    updateDisplay() {
        console.log('Updating display');
        
        // Update word display with underscores or guessed letters
        if (this.wordDisplay && this.currentWord) {
            this.wordDisplay.innerHTML = [...this.currentWord]
                .map(letter => `<span>${this.guessedLetters.has(letter) ? letter : '_'}</span>`)
                .join('');
        }
    }

    // End the game
    endGame(won) {
        console.log('Ending game, won:', won);
        
        // Display message
        const message = won ? 'Շնորհաւո՜ր, յաղթեցիք' : `Ցաւօք, պարտուեցաք։ Բառը՝ ${this.currentWord}`;
        if (this.messageDisplay) {
            this.messageDisplay.textContent = message;
            this.messageDisplay.className = won ? 'message win' : 'message lose';
        }
        
        // Stop the timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Play sound
        this.sounds.play(won ? 'win' : 'lose');
        
        // Disable all keyboard buttons
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Calculate time spent
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Update statistics
        this.statistics.updateStats(won, timeSpent);
        
        // Show end game alert
        setTimeout(() => {
            alert(`${message}\nԽաղացած ժամանակ: ${timeSpent} վայրկեան`);
        }, 500);
    }
}

// Statistics class to track game performance
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

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    window.game = new Game();
    console.log('Game initialization complete');
});
