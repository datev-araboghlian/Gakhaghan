// Word categories and their data
export const wordData = {
    'Կերակուր եւ Ըմպելիք': [
        'լաւաշ',     // lavash bread
        'դոլմա',     // dolma
        'խորոված',   // khorovats (BBQ)
        'թան',       // tan (yogurt drink)
        'գաթայ',     // gata
        'պանիր',     // cheese
        'մածուն',    // yogurt
        'բաստուրմա', // basturma
        'սուճուխ',   // sujukh
        'քյուֆթա'    // kyufta
    ],
    'Ընտանիք': [
        'մայր',      // mother
        'հայր',      // father
        'քոյր',      // sister
        'եղբայր',    // brother
        'տատ',       // grandmother
        'պապ',       // grandfather
        'հարս',      // bride/daughter-in-law
        'փեսայ',     // groom/son-in-law
        'զաւակ',     // child
        'թոռ'        // grandchild
    ],
    'Բնութիւն': [
        'ծառ',       // tree
        'ծաղիկ',     // flower
        'լեռ',       // mountain
        'գետ',       // river
        'ծով',       // sea
        'արեւ',      // sun
        'լուսին',    // moon
        'աստղ',      // star
        'անտառ',     // forest
        'երկինք'     // sky
    ],
    'Կենդանիներ': [
        'շուն',      // dog
        'կատու',     // cat
        'ձի',        // horse
        'առիւծ',     // lion
        'արջ',       // bear
        'գայլ',      // wolf
        'աղուէս',    // fox
        'նապաստակ', // rabbit
        'ոչխար',    // sheep
        'այծ'        // goat
    ]
};

// Get the daily word based on the current date
export function getDailyWord() {
    const today = new Date();
    const allWords = Object.values(wordData).flat();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const dailyWord = allWords[dayOfYear % allWords.length];
    console.log('Daily word selected:', dailyWord);
    return dailyWord;
}

// Check if the daily challenge was already played today
export function hasDailyChallengeBeenPlayed() {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const lastPlayedDate = localStorage.getItem('hangman_daily_last_played');
    return lastPlayedDate === today;
}

// Mark daily challenge as played for today
export function markDailyChallengeAsPlayed() {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    localStorage.setItem('hangman_daily_last_played', today);
}

// Get a random word from the specified category, excluding the daily word
export function getRandomWord(category = null) {
    // Get the daily word to exclude it
    const dailyWord = getDailyWord();
    
    let words;
    if (category && category !== 'all' && wordData[category]) {
        // If a valid category is specified
        words = [...wordData[category]];
    } else {
        // Get all words from all categories
        words = Object.values(wordData).flat();
    }
    
    // Remove the daily word from the selection pool
    const filteredWords = words.filter(word => word !== dailyWord);
    
    // If somehow all words were filtered out (unlikely), return a backup word
    if (filteredWords.length === 0) {
        return "խաղալիք"; // A backup word meaning "toy"
    }
    
    // Return a random word from the filtered list
    return filteredWords[Math.floor(Math.random() * filteredWords.length)];
}
