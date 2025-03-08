class HangmanGame {
    constructor() {
        this.categories = {
            all: [],  // Will be populated with all words
            food: ['խնձոր', 'պանիր', 'հաց', 'միս', 'կաթ', 'ձու', 'մածուն', 'պղպեղ', 'սոխ', 'լոլիկ'],
            nature: ['ծառ', 'ծաղիկ', 'լեռ', 'ծով', 'արեւ', 'լուսին', 'աստղ', 'երկինք', 'հող', 'քար'],
            family: ['մայր', 'հայր', 'քոյր', 'եղբայր', 'տատ', 'պապ', 'զաւակ', 'հարս', 'փեսայ', 'մօրքոյր'],
            objects: ['գիրք', 'սեղան', 'աթոռ', 'դուռ', 'պատուհան', 'հեռախօս', 'համակարգիչ', 'մատիտ', 'թուղթ', 'պայուսակ'],
            places: ['տուն', 'դպրոց', 'եկեղեցի', 'խանութ', 'այգի', 'գրադարան', 'թանգարան', 'հիւանդանոց', 'շուկայ', 'սրճարան'],
            abstract: ['սէր', 'յոյս', 'երազ', 'միտք', 'հաւատ', 'ուրախութիւն', 'տխրութիւն', 'կեանք', 'ժամանակ', 'ճշմարտութիւն'],
            culture: ['պար', 'երգ', 'լեզու', 'արուեստ', 'թատրոն', 'կրօն', 'աւանդոյթ', 'պատմութիւն', 'մշակոյթ', 'գրականութիւն'],
            professions: ['ուսուցիչ', 'բժիշկ', 'դերասան', 'երաժիշտ', 'նկարիչ', 'խոհարար', 'վարորդ', 'ճարտարապետ', 'փաստաբան', 'լրագրող'],
            colors: ['կարմիր', 'կապոյտ', 'դեղին', 'կանաչ', 'սեւ', 'ճերմակ', 'մանիշակագոյն', 'նարնջագոյն', 'շագանակագոյն', 'վարդագոյն'],
            animals: ['շուն', 'կատու', 'ձի', 'առիւծ', 'արջ', 'գայլ', 'աղուէս', 'նապաստակ', 'ոչխար', 'կով'],
            body: ['գլուխ', 'աչք', 'ականջ', 'բերան', 'քիթ', 'ձեռք', 'ոտք', 'մազ', 'սիրտ', 'մատ']
        };

        // Populate 'all' category
        this.categories.all = Object.values(this.categories)
            .flat()
            .filter(word => word !== undefined);

        this.initializeElements();
        this.setupEventListeners();
        this.showCategorySelection();
    }

    initializeElements() {
        this.categorySelectionElement = document.getElementById('categorySelection');
        this.gameAreaElement = document.getElementById('gameArea');
        this.wordDisplayElement = document.getElementById('wordDisplay');
        this.messageElement = document.getElementById('message');
        this.attemptsElement = document.getElementById('attempts');
        this.currentCategoryElement = document.getElementById('currentCategory');
        this.canvas = document.getElementById('hangmanCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    setupEventListeners() {
        // Category buttons
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', () => this.startGame(button.dataset.category));
        });

        // Keyboard buttons
        document.querySelectorAll('.key-btn').forEach(button => {
            button.addEventListener('click', () => this.makeGuess(button.textContent));
        });

        // Change category button
        document.getElementById('changeCategoryBtn').addEventListener('click', () => {
            this.showCategorySelection();
        });

        // Restart button
        document.getElementById('restartButton').addEventListener('click', () => {
            this.startGame(this.currentCategory);
        });
    }

    showCategorySelection() {
        this.categorySelectionElement.style.display = 'block';
        this.gameAreaElement.style.display = 'none';
        this.resetGame();
    }

    resetGame() {
        // Reset game state
        this.word = '';
        this.guessedLetters = new Set();
        this.remainingAttempts = 6;
        this.gameOver = false;

        // Reset UI
        this.wordDisplayElement.textContent = '';
        this.messageElement.textContent = '';
        this.attemptsElement.textContent = '6';

        // Reset keyboard
        document.querySelectorAll('.key-btn').forEach(button => {
            button.classList.remove('correct', 'wrong');
            button.disabled = false;
        });

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    startGame(category) {
        this.resetGame();
        
        this.currentCategory = category;
        const words = this.categories[category];
        this.word = words[Math.floor(Math.random() * words.length)];
        
        this.categorySelectionElement.style.display = 'none';
        this.gameAreaElement.style.display = 'block';
        
        // Update category display
        this.currentCategoryElement.textContent = category;
        
        // Initialize word display
        this.updateDisplay();
    }

    updateDisplay() {
        // Update word display
        this.wordDisplayElement.innerHTML = this.word
            .split('')
            .map(letter => {
                // Handle 'եւ' as a special case
                if (letter === 'ւ' && this.word.includes('ե')) {
                    return `<span>${(this.guessedLetters.has('և') || (this.guessedLetters.has('ե') && this.guessedLetters.has('ւ'))) ? letter : '_'}</span>`;
                }
                return `<span>${this.guessedLetters.has(letter) ? letter : '_'}</span>`;
            })
            .join('');

        // Update attempts counter
        this.attemptsElement.textContent = this.remainingAttempts;
    }

    makeGuess(letter) {
        if (this.gameOver || this.guessedLetters.has(letter)) return;

        // Add to guessed letters
        this.guessedLetters.add(letter);

        // Find the button for this letter
        const button = Array.from(document.querySelectorAll('.key-btn'))
            .find(btn => btn.textContent === letter);
        if (button) {
            button.disabled = true;
        }

        // Check if guess is correct
        const isCorrect = this.word.includes(letter) || 
            (letter === 'և' && this.word.includes('ե') && this.word.includes('ւ'));

        if (isCorrect) {
            this.showMessage('Ճիշտ է!', 'success');
            if (button) button.classList.add('correct');
        } else {
            this.remainingAttempts--;
            this.showMessage('Սխալ է:', 'error');
            if (button) button.classList.add('wrong');
            this.drawHangman(6 - this.remainingAttempts);
        }

        this.updateDisplay();
        this.checkGameStatus();
    }

    checkGameStatus() {
        // Convert word to array of unique letters
        const wordLetters = new Set(this.word.split(''));
        
        // Check for win - all letters must be guessed
        const hasWon = Array.from(wordLetters).every(letter => {
            if (letter === 'ւ' && this.word.includes('ե')) {
                return this.guessedLetters.has('և') || (this.guessedLetters.has('ե') && this.guessedLetters.has('ւ'));
            }
            return this.guessedLetters.has(letter);
        });

        if (hasWon) {
            this.gameOver = true;
            this.showMessage('Շնորհաւո՜ր, դուք յաղթեցիք:', 'success');
            return;
        }

        // Check for loss
        if (this.remainingAttempts <= 0) {
            this.gameOver = true;
            this.showMessage(`Խաղը աւարտուեցաւ: Բառը՝ ${this.word}`, 'error');
        }
    }

    showMessage(message, type) {
        this.messageElement.textContent = message;
        this.messageElement.className = `message ${type}`;
    }

    drawHangman(step) {
        const ctx = this.ctx;
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        switch(step) {
            case 1: // Draw gallows
                ctx.beginPath();
                ctx.moveTo(50, 150);
                ctx.lineTo(150, 150);
                ctx.moveTo(100, 150);
                ctx.lineTo(100, 50);
                ctx.lineTo(150, 50);
                ctx.lineTo(150, 70);
                ctx.stroke();
                break;
            case 2: // Draw head
                ctx.beginPath();
                ctx.arc(150, 85, 15, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 3: // Draw body
                ctx.beginPath();
                ctx.moveTo(150, 100);
                ctx.lineTo(150, 130);
                ctx.stroke();
                break;
            case 4: // Draw left arm
                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(130, 120);
                ctx.stroke();
                break;
            case 5: // Draw right arm
                ctx.beginPath();
                ctx.moveTo(150, 110);
                ctx.lineTo(170, 120);
                ctx.stroke();
                break;
            case 6: // Draw legs
                ctx.beginPath();
                ctx.moveTo(150, 130);
                ctx.lineTo(130, 145);
                ctx.moveTo(150, 130);
                ctx.lineTo(170, 145);
                ctx.stroke();
                break;
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new HangmanGame();
});
