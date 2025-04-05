// Word categories and their data
const wordData = {
    'Կերակուր եւ խոհանոց': [
        'լաւաշ',       // lavash bread
        'տոլմա',       // dolma
        'խորոված',     // khorovats (BBQ)
        'թան',         // tan (yogurt drink)
        'գաթայ',       // gata
        'պանիր',       // cheese
        'մածուն',      // yogurt
        'սուճուխ',     // sujukh
        'կաթ',         // milk
        'ձէթ',         // oil
        'բրինձ',       // rice
        'շաքար',       // sugar
        'կարկանդակ',   // cake
        'անուշեղէն',   // dessert
        'պաղպաղակ',    // ice cream
        'սմբուկ',      // eggplant
        'չիր',         // dried fruit
        'գետնախնձոր',  // potato
        'պանան',       // banana
        'նարինջ'       // orange
    ],
    'Ընտանիք': [
        'մայր',             // mother
        'հայր',             // father
        'քոյր',             // sister
        'եղբայր',           // brother
        'հարս',             // bride/daughter-in-law
        'փեսայ',            // groom/son-in-law
        'զաւակ',            // child
        'թոռ',              // grandchild
        'մօրաքոյր',         // maternal aunt
        'հօրեղբայր',        // paternal uncle
        'քեռի',             // uncle (mother's side)
        'սանուկ',           // godchild
        'կնքամայր',         // godmother
        'կնքահայր',         // godfather
        'զարմիկ',           // cousin (male)
        'թոռնիկ',           // grandchild
        'կեսուր',           // mother-in-law
        'խնամի',            // in-law
        'նշանած',           // fiancé
        'ամուսնալուծուած'   // divorced
    ],
    'Բնութիւն': [
        'ծառ',         // tree
        'ծաղիկ',       // flower
        'լեռ',         // mountain
        'գետ',         // river
        'ծով',         // sea
        'արեւ',        // sun
        'լուսին',      // moon
        'աստղ',        // star
        'անտառ',       // forest
        'երկինք',      // sky
        'ծիածան',      // rainbow
        'հովանոց',     // umbrella
        'որոտում',     // thunder
        'կայծակ',      // lightning
        'դաշտ',        // plain
        'ջրվէժ',       // waterfall
        'բամպակ',      // cotton
        'գարուն',      // spring (season)
        'աշուն',       // autumn
        'ամառ',        // summer
        'ձմեռ'         // winter
    ],
    'Կենդանիներ': [
        'շուն',           // dog
        'կատու',          // cat
        'ձի',             // horse
        'առիւծ',          // lion
        'արջ',            // bear
        'գայլ',           // wolf
        'աղուէս',         // fox
        'նապաստակ',       // rabbit
        'ոչխար',          // sheep
        'այծ',            // goat
        'աղաւնի',         // dove
        'աքլոր',          // rooster
        'թռչուն',         // bird
        'եղնիկ',          // deer
        'սկիւռ',          // squirrel
        'բու',             // owl
        'ոզնի',           // hedgehog
        'ագռաւ',          // raven
        'կռունկ',         // crane (bird)
        'մեղու',   // beehive
        'գորտ',           // frog
        'ճայ',            // seagull
    ],
    'Հագուստ': [
        'հագուստ',    // robe/clothing
        'շապիկ',      // shirt
        'տաբատ',      // pants
        'ձեռնոց',     // glove
        'ակնոց',      // glasses
        'կոճակ',      // button
        'մոյկ',       // boots
        'փէշ'         // skirt
    ],
    'Գոյներ': [
        'կարմիր',          // red
        'կապոյտ',          // blue
        'կանաչ',           // green
        'դեղին',           // yellow
        'սեւ',             // black
        'ճերմակ',          // white
        'մոխրագոյն',       // gray
        'սրճագոյն',        // brown
        'նարնջագոյն',      // orange
        'մանիշակագոյն'     // purple
    ],
    'Մասնագիտութիւն': [
        'ուսուցիչ',        // teacher
        'բժիշկ',           // doctor
        'ճարտարապետ',     // architect
        'դերասան',         // actor
        'երաժիշտ',         // musician
        'բանաստեղծ',       // poet
        'նկարիչ',          // painter
        'ոստիկան',         // police officer
        'ծրագրաւորող',     // programmer
        'հաշուապահ',       // accountant
    ],
    'Առարկաներ եւ Գործիքներ': [
        'մատիտ',        // pencil
        'գրիչ',         // pen
        'տետրակ',       // notebook
        'պայուսակ',     // bag
        'հեռատեսիլ',    // television
        'ձայնասփիւռ',   // radio
        'լուսանկար',    // photograph
        'բանալի',       // key
        'ժամացոյց',     // clock
        'արհեստանոց',   // workshop
        'սանդուխ',      // ladder
        'կացին'         // axe
    ],
    'Զգացումներ': [
        'ուրախութիւն',    // happiness
        'տխրութիւն',      // sadness
        'զայրոյթ',        // anger
        'վախ',            // fear
        'սէր',            // love
        'հպարտութիւն',    // pride
        'ամօթ',           // shame
        'կասկած',         // doubt
        'յոյս'            // hope
    ]
};

// Cache for the daily word to avoid recalculating it
let cachedDailyWord = null;
let cachedDate = null;

// Get all words from all categories
function getAllWords() {
    return Object.values(wordData).flat();
}

// Get the daily word based on the current date
function getDailyWord() {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Return cached value if we already calculated it today
    if (cachedDailyWord && cachedDate === today) {
        return cachedDailyWord;
    }
    
    const allWords = getAllWords();
    const currentDate = new Date();
    const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    
    // Store in cache
    cachedDailyWord = allWords[dayOfYear % allWords.length];
    cachedDate = today;
    
    console.log('Daily word selected:', cachedDailyWord);
    return cachedDailyWord;
}

// Check if the daily challenge was already played today
function hasDailyChallengeBeenPlayed() {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const lastPlayedDate = localStorage.getItem('hangman_daily_last_played');
    return lastPlayedDate === today;
}

// Mark daily challenge as played for today
function markDailyChallengeAsPlayed() {
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    localStorage.setItem('hangman_daily_last_played', today);
}

// Get a random word from a specific category or any category if none specified
function getRandomWord(category = null) {
    // Get the daily word to exclude it
    const dailyWord = getDailyWord();
    
    // If category is Խառն (random/mixed), pick a random word from any category
    if (category === 'Խառն') {
        // Get all words from all categories
        let allWords = [];
        for (const cat in wordData) {
            allWords = allWords.concat(wordData[cat]);
        }
        
        // Filter out the daily word
        const filteredWords = allWords.filter(word => word !== dailyWord);
        
        // Return a random word from all categories
        if (filteredWords.length > 0) {
            return filteredWords[Math.floor(Math.random() * filteredWords.length)];
        } else {
            return "խաղալիք"; // A backup word meaning "toy"
        }
    }
    
    // If a valid category is provided, get a word from that category
    if (category && wordData[category]) {
        // Filter out the daily word
        const filteredWords = wordData[category].filter(word => word !== dailyWord);
        
        if (filteredWords.length > 0) {
            return filteredWords[Math.floor(Math.random() * filteredWords.length)];
        } else {
            // If somehow all words were filtered out, use a backup word
            console.warn('All words filtered out, using backup word');
            return "խաղալիք"; // A backup word meaning "toy"
        }
    }
    
    // If no category is provided or it's invalid, pick a random category
    const categories = Object.keys(wordData);
    if (categories.length === 0) return "խաղալիք"; // Backup word
    
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const filteredWords = wordData[randomCategory].filter(word => word !== dailyWord);
    
    if (filteredWords.length > 0) {
        return filteredWords[Math.floor(Math.random() * filteredWords.length)];
    } else {
        // If somehow all words were filtered out, use a backup word
        console.warn('All words filtered out, using backup word');
        return "խաղալիք"; // A backup word meaning "toy"
    }
}
