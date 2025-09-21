// Application state ULTRA
const state = {
    participants: [],
    winners: [],
    currentTheme: 'light',
    isSpinning: false,
    soundsEnabled: true,
    animationsEnabled: true,
    confettiEnabled: true,
    hapticEnabled: false,
    rotationSpeed: 5,
    spinDuration: 4,
    masterVolume: 70,
    effectsVolume: 80,
    rouletteColor: '#4e54c8',
    rouletteSize: 400,
    totalSpins: 0,
    autoSpinEnabled: false,
    autoSpinInterval: null,
    statistics: {
        totalParticipants: 0,
        totalWinners: 0,
        totalSpins: 0,
        avgSpinTime: 0,
        spinTimes: []
    }
};

// DOM Elements ULTRA
const elements = {
    participantForm: document.getElementById('addParticipantForm'),
    participantInput: document.getElementById('participantName'),
    participantsList: document.getElementById('participantsList'),
    participantCount: document.getElementById('participantCount'),
    liveParticipantCount: document.getElementById('liveParticipantCount'),
    liveWinnerCount: document.getElementById('liveWinnerCount'),
    winnersList: document.getElementById('winnersList'),
    spinButton: document.getElementById('spinButton'),
    resetButton: document.getElementById('resetButton'),
    autoSpinBtn: document.getElementById('autoSpinBtn'),
    themeDropdown: document.getElementById('themeDropdown'),
    csvFileInput: document.getElementById('csvFileInput'),
    importCsvBtn: document.getElementById('importCsvBtn'),
    addRandomBtn: document.getElementById('addRandomBtn'),
    shuffleBtn: document.getElementById('shuffleBtn'),
    searchParticipants: document.getElementById('searchParticipants'),
    exportResultsBtn: document.getElementById('exportResultsBtn'),
    shareResultsBtn: document.getElementById('shareResultsBtn'),
    qrCodeBtn: document.getElementById('qrCodeBtn'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    soundToggle: document.getElementById('soundToggle'),
    animationsToggle: document.getElementById('animationsToggle'),
    confettiToggle: document.getElementById('confettiToggle'),
    hapticToggle: document.getElementById('hapticToggle'),
    rotationSpeed: document.getElementById('rotationSpeed'),
    spinDuration: document.getElementById('spinDuration'),
    rouletteColor: document.getElementById('rouletteColor'),
    rouletteSize: document.getElementById('rouletteSize'),
    masterVolume: document.getElementById('masterVolume'),
    effectsVolume: document.getElementById('effectsVolume'),
    rotationSpeedValue: document.getElementById('rotationSpeedValue'),
    spinDurationValue: document.getElementById('spinDurationValue'),
    rouletteCanvas: document.getElementById('rouletteCanvas'),
    confettiCanvas: document.getElementById('confettiCanvas'),
    particlesCanvas: document.getElementById('particlesCanvas'),
    helpBtn: document.getElementById('helpBtn'),
    statsBtn: document.getElementById('statsBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    spinStatus: document.getElementById('spinStatus'),
    winnersChart: document.getElementById('winnersChart')
};

// Roulette variables ULTRA
let rouletteCtx;
let particlesCtx;
let rotation = 0;
let spinningAnimation = null;
let currentSegment = 0;
let particles = [];
let sounds = {};
let spinStartTime = 0;

// Initialize the application ULTRA
function init() {
    console.log('🎡 Initializing LuckySpin Ultra...');
    
    // Check if all elements are loaded
    const missingElements = [];
    Object.keys(elements).forEach(key => {
        if (!elements[key]) {
            missingElements.push(key);
        }
    });
    
    if (missingElements.length > 0) {
        console.warn('⚠️ Missing elements:', missingElements);
    }
    
    setupEventListeners();
    loadFromLocalStorage();
    updateUI();
    setupRoulette();
    setupConfetti();
    setupParticles();
    setupSounds();
    setupThemeDropdown();
    startParticleAnimation();
    updateLiveStats();
    
    console.log('✅ LuckySpin Ultra initialized successfully!');
    
    // Add some test participants if none exist
    if (state.participants.length === 0) {
        console.log('🧪 Adding test participants...');
        addTestParticipants();
    }
    
    // Add test function to window for debugging
    window.testAutoSpin = () => {
        console.log('🧪 Testing auto spin manually...');
        toggleAutoSpin();
    };
    
    console.log('🧪 Test function added: window.testAutoSpin()');
}

// Set up event listeners ULTRA
function setupEventListeners() {
    // Form submission
    if (elements.participantForm) {
        console.log('✅ Adding event listener to participant form');
    elements.participantForm.addEventListener('submit', addParticipant);
    } else {
        console.error('❌ Participant form not found!');
    }
    
    // Also add click listener to the submit button directly
    const submitButton = document.querySelector('#addParticipantForm button[type="submit"]');
    if (submitButton) {
        console.log('✅ Adding click listener to submit button');
        submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            addParticipant(e);
        });
    } else {
        console.error('❌ Submit button not found!');
    }
    
    // Buttons principaux
    if (elements.spinButton) {
        console.log('✅ Adding spin button event listener');
    elements.spinButton.addEventListener('click', spinRoulette);
    } else {
        console.error('❌ Spin button not found!');
    }
    
    if (elements.resetButton) {
        console.log('✅ Adding reset button event listener');
    elements.resetButton.addEventListener('click', resetApplication);
    } else {
        console.error('❌ Reset button not found!');
    }
    
    if (elements.autoSpinBtn) {
        console.log('✅ Adding auto spin button event listener');
        elements.autoSpinBtn.addEventListener('click', toggleAutoSpin);
    } else {
        console.error('❌ Auto spin button not found!');
    }
    
    // Boutons d'import/export
    if (elements.importCsvBtn) elements.importCsvBtn.addEventListener('click', () => elements.csvFileInput?.click());
    if (elements.csvFileInput) elements.csvFileInput.addEventListener('change', importFromCSV);
    if (elements.exportResultsBtn) elements.exportResultsBtn.addEventListener('click', exportResults);
    if (elements.shareResultsBtn) elements.shareResultsBtn.addEventListener('click', shareResults);
    if (elements.qrCodeBtn) elements.qrCodeBtn.addEventListener('click', showQRCode);
    if (elements.clearHistoryBtn) elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Boutons d'action
    if (elements.addRandomBtn) elements.addRandomBtn.addEventListener('click', addRandomParticipant);
    if (elements.shuffleBtn) elements.shuffleBtn.addEventListener('click', shuffleParticipants);
    if (elements.helpBtn) elements.helpBtn.addEventListener('click', showHelp);
    if (elements.statsBtn) elements.statsBtn.addEventListener('click', showStats);
    if (elements.settingsBtn) elements.settingsBtn.addEventListener('click', showSettings);
    
    // Recherche
    if (elements.searchParticipants) {
        console.log('✅ Adding search event listener');
        elements.searchParticipants.addEventListener('input', filterParticipants);
    } else {
        console.error('❌ Search input not found!');
    }
    
    // Enter key on participant input
    if (elements.participantInput) {
        elements.participantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                addParticipant(e);
            }
        });
    }
    
    // Paramètres
    if (elements.soundToggle) {
    elements.soundToggle.addEventListener('change', (e) => {
        state.soundsEnabled = e.target.checked;
        saveToLocalStorage();
    });
    }
    
    if (elements.animationsToggle) {
    elements.animationsToggle.addEventListener('change', (e) => {
        state.animationsEnabled = e.target.checked;
        saveToLocalStorage();
    });
    }
    
    if (elements.confettiToggle) {
        elements.confettiToggle.addEventListener('change', (e) => {
            state.confettiEnabled = e.target.checked;
            saveToLocalStorage();
        });
    }
    
    if (elements.hapticToggle) {
        elements.hapticToggle.addEventListener('change', (e) => {
            state.hapticEnabled = e.target.checked;
            saveToLocalStorage();
        });
    }
    
    if (elements.rotationSpeed) {
    elements.rotationSpeed.addEventListener('input', (e) => {
        state.rotationSpeed = parseInt(e.target.value);
            updateSliderValue('rotationSpeedValue', e.target.value);
        saveToLocalStorage();
    });
    }
    
    if (elements.spinDuration) {
        elements.spinDuration.addEventListener('input', (e) => {
            state.spinDuration = parseInt(e.target.value);
            updateSliderValue('spinDurationValue', e.target.value + 's');
            saveToLocalStorage();
        });
    }
    
    if (elements.rouletteColor) {
        elements.rouletteColor.addEventListener('change', (e) => {
            state.rouletteColor = e.target.value;
            drawRoulette();
            saveToLocalStorage();
        });
    }
    
    if (elements.rouletteSize) {
        elements.rouletteSize.addEventListener('input', (e) => {
            state.rouletteSize = parseInt(e.target.value);
            updateRouletteSize();
            saveToLocalStorage();
        });
    }
    
    if (elements.masterVolume) {
        elements.masterVolume.addEventListener('input', (e) => {
            state.masterVolume = parseInt(e.target.value);
            updateVolume();
            saveToLocalStorage();
        });
    }
    
    if (elements.effectsVolume) {
        elements.effectsVolume.addEventListener('input', (e) => {
            state.effectsVolume = parseInt(e.target.value);
            updateVolume();
            saveToLocalStorage();
        });
    }
}

// Set up the roulette
function setupRoulette() {
    if (elements.rouletteCanvas) {
    rouletteCtx = elements.rouletteCanvas.getContext('2d');
    drawRoulette();
    } else {
        console.error('❌ Roulette canvas not found!');
    }
}

// Set up confetti canvas ULTRA
function setupConfetti() {
    if (elements.confettiCanvas) {
    elements.confettiCanvas.width = window.innerWidth;
    elements.confettiCanvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        elements.confettiCanvas.width = window.innerWidth;
        elements.confettiCanvas.height = window.innerHeight;
    });
    }
}

// Set up particles system
function setupParticles() {
    if (elements.particlesCanvas) {
        particlesCtx = elements.particlesCanvas.getContext('2d');
        elements.particlesCanvas.width = window.innerWidth;
        elements.particlesCanvas.height = window.innerHeight;
        
        // Initialize particles
        for (let i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`
            });
        }
        
        window.addEventListener('resize', () => {
            elements.particlesCanvas.width = window.innerWidth;
            elements.particlesCanvas.height = window.innerHeight;
        });
    }
}

// Set up sounds system
function setupSounds() {
    try {
        // Créer des sons synthétiques avec Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        sounds.spin = createTone(audioContext, 200, 0.5, 'sine');
        sounds.win = createTone(audioContext, 400, 1, 'square');
        sounds.click = createTone(audioContext, 800, 0.1, 'triangle');
        sounds.add = createTone(audioContext, 600, 0.2, 'sawtooth');
        
        console.log('🔊 Sounds system initialized');
    } catch (error) {
        console.warn('⚠️ Audio context not supported:', error);
    }
}

// Create synthetic tones
function createTone(audioContext, frequency, duration, type) {
    return () => {
        if (!state.soundsEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(state.masterVolume / 100 * 0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    };
}

// Setup theme dropdown
function setupThemeDropdown() {
    const dropdownItems = document.querySelectorAll('[data-theme]');
    dropdownItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const theme = item.getAttribute('data-theme');
            changeTheme(theme);
        });
    });
}

// Start particle animation
function startParticleAnimation() {
    if (!particlesCtx || !elements.particlesCanvas) return;
    
    function animateParticles() {
        if (!particlesCtx || !elements.particlesCanvas) return;
        
        particlesCtx.clearRect(0, 0, elements.particlesCanvas.width, elements.particlesCanvas.height);
        
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            if (particle.x < 0 || particle.x > elements.particlesCanvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > elements.particlesCanvas.height) particle.vy *= -1;
            
            particlesCtx.beginPath();
            particlesCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            particlesCtx.fillStyle = particle.color;
            particlesCtx.globalAlpha = particle.opacity;
            particlesCtx.fill();
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
}

// Update live statistics
function updateLiveStats() {
    if (elements.liveParticipantCount) {
        elements.liveParticipantCount.textContent = state.participants.length;
        elements.liveParticipantCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elements.liveParticipantCount.style.transform = 'scale(1)';
        }, 200);
    }
    
    if (elements.liveWinnerCount) {
        elements.liveWinnerCount.textContent = state.winners.length;
        elements.liveWinnerCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            elements.liveWinnerCount.style.transform = 'scale(1)';
        }, 200);
    }
}

// Draw the roulette
function drawRoulette() {
    if (!rouletteCtx || !elements.rouletteCanvas) return;
    
    const width = elements.rouletteCanvas.width;
    const height = elements.rouletteCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // Clear canvas
    rouletteCtx.clearRect(0, 0, width, height);
    
    // Draw segments
    if (state.participants.length > 0) {
        const segmentAngle = (2 * Math.PI) / state.participants.length;
        
        state.participants.forEach((participant, index) => {
            const startAngle = index * segmentAngle + rotation;
            const endAngle = (index + 1) * segmentAngle + rotation;
            
            // Draw segment
            rouletteCtx.beginPath();
            rouletteCtx.moveTo(centerX, centerY);
            rouletteCtx.arc(centerX, centerY, radius, startAngle, endAngle);
            rouletteCtx.closePath();
            
            // Color based on index
            const hue = (index * 360 / state.participants.length) % 360;
            rouletteCtx.fillStyle = `hsl(${hue}, 70%, 60%)`;
            rouletteCtx.fill();
            
            // Add stroke
            rouletteCtx.strokeStyle = 'white';
            rouletteCtx.lineWidth = 2;
            rouletteCtx.stroke();
            
            // Add text
            rouletteCtx.save();
            rouletteCtx.translate(centerX, centerY);
            rouletteCtx.rotate(startAngle + segmentAngle / 2);
            rouletteCtx.textAlign = 'right';
            rouletteCtx.fillStyle = 'white';
            rouletteCtx.font = '14px Arial';
            
            // Truncate text if too long
            const maxTextLength = 10;
            const displayText = participant.name.length > maxTextLength 
                ? participant.name.substring(0, maxTextLength) + '...' 
                : participant.name;
                
            rouletteCtx.fillText(displayText, radius - 15, 5);
            rouletteCtx.restore();
        });
    } else {
        // Draw empty roulette
        rouletteCtx.beginPath();
        rouletteCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        rouletteCtx.fillStyle = '#f0f0f0';
        rouletteCtx.fill();
        rouletteCtx.strokeStyle = '#ccc';
        rouletteCtx.lineWidth = 2;
        rouletteCtx.stroke();
        
        // Add text
        rouletteCtx.textAlign = 'center';
        rouletteCtx.fillStyle = '#999';
        rouletteCtx.font = '16px Arial';
        rouletteCtx.fillText('Ajoutez des participants', centerX, centerY);
    }
    
    // Draw center circle
    rouletteCtx.beginPath();
    rouletteCtx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    rouletteCtx.fillStyle = 'white';
    rouletteCtx.fill();
    rouletteCtx.strokeStyle = '#ccc';
    rouletteCtx.lineWidth = 2;
    rouletteCtx.stroke();
}

// Add a participant ULTRA
function addParticipant(e) {
    e.preventDefault();
    
    console.log('🎯 Attempting to add participant(s)...');
    console.log('📝 Participant input element:', elements.participantInput);
    
    if (!elements.participantInput) {
        console.error('❌ Participant input element not found!');
        showNotification('Erreur: Champ de saisie non trouvé!', 'danger');
        return;
    }
    
    const inputValue = elements.participantInput.value.trim();
    console.log('📝 Input value:', inputValue);
    
    if (!inputValue) {
        console.log('⚠️ Empty input, returning...');
        showNotification('Veuillez entrer au moins un nom!', 'warning');
        return;
    }
    
    // Split participants by various separators
    const separators = /[,\n\r-]+/;
    const names = inputValue.split(separators)
        .map(name => name.trim())
        .filter(name => name.length > 0);
    
    console.log('📝 Parsed names:', names);
    
    if (names.length === 0) {
        showNotification('Aucun nom valide trouvé!', 'warning');
        return;
    }
    
    const addedParticipants = [];
    const duplicates = [];
    
    names.forEach(name => {
    if (state.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
            duplicates.push(name);
        } else {
            const participant = {
                id: Date.now() + Math.random(),
                name: name,
                dateAdded: new Date().toISOString(),
                emoji: getRandomEmoji()
            };
            state.participants.push(participant);
            addedParticipants.push(participant);
        }
    });
    
    console.log('✅ Participants added:', addedParticipants);
    console.log('⚠️ Duplicates found:', duplicates);
    
    elements.participantInput.value = '';
    
    // Play sound
    if (sounds.add) sounds.add();
    
    // Haptic feedback
    if (state.hapticEnabled && navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    updateUI();
    saveToLocalStorage();
    
    // Show appropriate notification
    if (addedParticipants.length > 0) {
        if (addedParticipants.length === 1) {
            showNotification(`🎉 ${addedParticipants[0].emoji} ${addedParticipants[0].name} ajouté!`, 'success');
        } else {
            showNotification(`🎉 ${addedParticipants.length} participants ajoutés!`, 'success');
        }
    }
    
    if (duplicates.length > 0) {
        showNotification(`⚠️ ${duplicates.length} participant(s) déjà existant(s) ignoré(s)`, 'warning');
    }
}

// Add random participant
function addRandomParticipant() {
    const randomNames = [
        'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
        'Ivy', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
        'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
        'Yara', 'Zoe', 'Alex', 'Blake', 'Casey', 'Drew', 'Emery', 'Finley'
    ];
    
    const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    const name = `${randomName} ${randomNumber}`;
    
    elements.participantInput.value = name;
    addParticipant({ preventDefault: () => {} });
}

// Shuffle participants
function shuffleParticipants() {
    if (state.participants.length < 2) {
        showNotification('Il faut au moins 2 participants pour mélanger! 🎲', 'warning');
        return;
    }
    
    for (let i = state.participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.participants[i], state.participants[j]] = [state.participants[j], state.participants[i]];
    }
    
    updateUI();
    drawRoulette();
    saveToLocalStorage();
    showNotification('🎲 Participants mélangés!', 'success');
}

// Filter participants
function filterParticipants() {
    console.log('🔍 Filtering participants...');
    
    if (!elements.searchParticipants) {
        console.error('❌ Search input not found!');
        return;
    }
    
    const searchTerm = elements.searchParticipants.value.toLowerCase();
    console.log('🔍 Search term:', searchTerm);
    
    const items = document.querySelectorAll('#participantsList .list-group-item');
    console.log('📋 Found items:', items.length);
    
    items.forEach(item => {
        // Look for the participant name in the correct element
        const nameElement = item.querySelector('.participant-name');
        if (nameElement) {
            const name = nameElement.textContent.toLowerCase();
            console.log('👤 Checking participant:', name);
            
            // If search term is empty, show all participants
            if (searchTerm === '' || name.includes(searchTerm)) {
                item.style.display = 'flex';
                console.log('✅ Showing participant:', name);
            } else {
                item.style.display = 'none';
                console.log('❌ Hiding participant:', name);
            }
        } else {
            console.warn('⚠️ No participant name found in item');
        }
    });
}

// Get random emoji
function getRandomEmoji() {
    const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

// Add test participants
function addTestParticipants() {
    const testNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
    
    testNames.forEach(name => {
    const participant = {
            id: Date.now() + Math.random(),
        name: name,
            dateAdded: new Date().toISOString(),
            emoji: getRandomEmoji()
    };
    
    state.participants.push(participant);
    });
    
    updateUI();
    saveToLocalStorage();
    console.log('✅ Test participants added:', testNames);
}

// Remove a participant
function removeParticipant(id) {
    state.participants = state.participants.filter(p => p.id !== id);
    updateUI();
    saveToLocalStorage();
    showNotification('Participant supprimé', 'info');
}

// Import from CSV
function importFromCSV(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        const lines = csvData.split('\n');
        let importedCount = 0;
        
        lines.forEach(line => {
            const name = line.trim();
            if (name && !state.participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
                state.participants.push({
                    id: Date.now() + Math.random(),
                    name: name,
                    dateAdded: new Date().toISOString()
                });
                importedCount++;
            }
        });
        
        updateUI();
        saveToLocalStorage();
        showNotification(`${importedCount} participants importés avec succès!`, 'success');
        
        // Reset file input
        elements.csvFileInput.value = '';
    };
    
    reader.readAsText(file);
}

// Spin the roulette ULTRA
function spinRoulette() {
    if (state.isSpinning || state.participants.length === 0) return;
    
    state.isSpinning = true;
    elements.spinButton.disabled = true;
    spinStartTime = performance.now();
    
    // Update status
    updateSpinStatus('🎡 La roulette tourne...', 'spinning');
    
    // Determine winner index
    const winnerIndex = Math.floor(Math.random() * state.participants.length);
    const winner = state.participants[winnerIndex];
    
    // Calculate rotation (multiple full rotations plus offset to winning segment)
    const segmentAngle = (2 * Math.PI) / state.participants.length;
    const extraRotations = 5 + Math.random() * 3; // 5-8 extra rotations
    const targetRotation = extraRotations * 2 * Math.PI + (winnerIndex * segmentAngle);
    
    // Animate the spin
    const startRotation = rotation;
    const startTime = performance.now();
    const duration = state.spinDuration * 1000; // Use custom duration
    
    function animateSpin(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function (easeOutCubic)
        const easing = 1 - Math.pow(1 - progress, 3);
        
        rotation = startRotation + (targetRotation * easing);
        
        drawRoulette();
        
        // Play spin sound during animation
        if (state.soundsEnabled && sounds.spin && progress < 0.9) {
            if (Math.random() < 0.1) sounds.spin();
        }
        
        if (progress < 1) {
            spinningAnimation = requestAnimationFrame(animateSpin);
        } else {
            // Animation complete
            finishSpin(winner);
        }
    }
    
    spinningAnimation = requestAnimationFrame(animateSpin);
    
    // Play initial spin sound
    if (sounds.spin) sounds.spin();
    
    // Haptic feedback
    if (state.hapticEnabled && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
    
    // Update statistics
    state.totalSpins++;
    state.statistics.totalSpins++;
}

// Update spin status
function updateSpinStatus(message, type = 'ready') {
    if (elements.spinStatus) {
        elements.spinStatus.innerHTML = `<span class="emoji">${type === 'spinning' ? '🎡' : type === 'winner' ? '🏆' : '⏳'}</span> ${message}`;
        elements.spinStatus.className = `status-indicator ${type}`;
    }
}

// Toggle auto spin
function toggleAutoSpin() {
    console.log('🎲 Toggle auto spin clicked!');
    console.log('🎲 Current auto spin state:', state.autoSpinEnabled);
    console.log('🎲 Participants count:', state.participants.length);
    
    if (state.autoSpinEnabled) {
        // Stop auto spin
        console.log('🛑 Stopping auto spin...');
        clearInterval(state.autoSpinInterval);
        state.autoSpinEnabled = false;
        
        if (elements.autoSpinBtn) {
            elements.autoSpinBtn.innerHTML = '<i class="fas fa-magic me-2"></i>🎲 Auto-Spin';
            elements.autoSpinBtn.classList.remove('btn-success');
            elements.autoSpinBtn.classList.add('btn-outline-warning');
        }
        
        showNotification('🛑 Auto-Spin arrêté', 'info');
    } else {
        // Start auto spin
        console.log('🚀 Starting auto spin...');
        
        if (state.participants.length < 2) {
            showNotification('Il faut au moins 2 participants pour l\'auto-spin! 🎲', 'warning');
            return;
        }
        
        state.autoSpinEnabled = true;
        
        if (elements.autoSpinBtn) {
            elements.autoSpinBtn.innerHTML = '<i class="fas fa-stop me-2"></i>🛑 Arrêter';
            elements.autoSpinBtn.classList.remove('btn-outline-warning');
            elements.autoSpinBtn.classList.add('btn-success');
        }
        
        state.autoSpinInterval = setInterval(() => {
            console.log('⏰ Auto spin interval triggered');
            console.log('⏰ Is spinning:', state.isSpinning);
            console.log('⏰ Participants:', state.participants.length);
            
            if (!state.isSpinning && state.participants.length > 0) {
                console.log('🎡 Auto spinning now!');
                spinRoulette();
            } else {
                console.log('⏰ Auto spin skipped - conditions not met');
            }
        }, 3000); // Spin every 3 seconds for testing
        
        showNotification('🚀 Auto-Spin activé!', 'success');
        console.log('✅ Auto spin interval set');
    }
}

// Finish the spin and show winner
function finishSpin(winner) {
    state.isSpinning = false;
    
    // Calculate spin time
    const spinTime = (performance.now() - spinStartTime) / 1000;
    state.statistics.spinTimes.push(spinTime);
    
    // Add to winners
    state.winners.unshift({
        ...winner,
        winDate: new Date().toISOString()
    });
    
    // Update status
    updateSpinStatus(`🏆 ${winner.name} a gagné !`, 'winner');
    
    // Update UI
    updateUI();
    updateLiveStats();
    saveToLocalStorage();
    
    // Show winner with confetti
    showWinner(winner);
    
    // Re-enable spin button if there are still participants
    if (state.participants.length > 0) {
        elements.spinButton.disabled = false;
    }
    
    // Reset status after 3 seconds
    setTimeout(() => {
        updateSpinStatus('⏳ Prêt à tourner !', 'ready');
    }, 3000);
}

// Show winner with confetti
function showWinner(winner) {
    // Show SweetAlert popup
    Swal.fire({
        title: 'Félicitations!',
        html: `<h3 class="text-success">${winner.name}</h3> a gagné!`,
        icon: 'success',
        confirmButtonText: 'Super!',
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
        customClass: {
            popup: 'animated zoomIn'
        }
    });
    
    // Launch confetti if animations enabled
    if (state.confettiEnabled) {
        launchConfetti();
    }
    
    // Play win sound if enabled
    if (state.soundsEnabled && sounds.win) {
        sounds.win();
    }
}

// Launch confetti animation
function launchConfetti() {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    
    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    
    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
            return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        
        // Launch confetti from the left edge
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        
        // Launch confetti from the right edge
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Export results to CSV
function exportResults() {
    if (state.winners.length === 0) {
        showNotification('Aucun résultat à exporter!', 'warning');
        return;
    }
    
    let csvContent = "Gagnant,Date de gain\n";
    state.winners.forEach(winner => {
        csvContent += `${winner.name},${new Date(winner.winDate).toLocaleDateString()}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `resultats-luckyspin-${new Date().toISOString().slice(0, 10)}.csv`);
    
    showNotification('Résultats exportés avec succès!', 'success');
}

// Share results via QR code
function shareResults() {
    if (state.winners.length === 0) {
        showNotification('Aucun résultat à partager!', 'warning');
        return;
    }
    
    // Create shareable content
    const shareContent = state.winners.map(winner => 
        `${winner.name} - ${new Date(winner.winDate).toLocaleDateString()}`
    ).join('\n');
    
    // Create QR code
    const qrElement = document.getElementById('qrcode');
    qrElement.innerHTML = '';
    
    new QRCode(qrElement, {
        text: shareContent,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
    modal.show();
}

// Change theme
function changeTheme(theme) {
    state.currentTheme = theme;
    document.body.setAttribute('data-theme', state.currentTheme);
    
    saveToLocalStorage();
    showNotification(`🎨 Thème ${theme} activé!`, 'info');
    
    // Play sound
    if (sounds.click) sounds.click();
}

// Show statistics modal
function showStats() {
    // Update statistics
    document.getElementById('totalParticipants').textContent = state.participants.length;
    document.getElementById('totalWinners').textContent = state.winners.length;
    document.getElementById('totalSpins').textContent = state.totalSpins;
    
    const avgTime = state.statistics.spinTimes.length > 0 
        ? (state.statistics.spinTimes.reduce((a, b) => a + b, 0) / state.statistics.spinTimes.length).toFixed(1)
        : '0';
    document.getElementById('avgSpinTime').textContent = `${avgTime}s`;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('statsModal'));
    modal.show();
    
    // Create chart if Chart.js is available
    if (typeof Chart !== 'undefined') {
        createWinnersChart();
    }
}

// Show settings modal
function showSettings() {
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
}

// Clear history
function clearHistory() {
    Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "L'historique des gagnants sera effacé!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, effacer!',
        cancelButtonText: 'Annuler',
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
    }).then((result) => {
        if (result.isConfirmed) {
            state.winners = [];
            updateUI();
    saveToLocalStorage();
            showNotification('🗑️ Historique effacé!', 'success');
        }
    });
}

// Show QR Code
function showQRCode() {
    console.log('📱 Generating QR Code...');
    
    // Get current URL
    const currentUrl = window.location.href;
    console.log('📱 Current URL:', currentUrl);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('qrCodeModal'));
    modal.show();
    
    // Generate QR Code
    const canvas = document.getElementById('qrCodeCanvas');
    if (canvas && window.QRCode) {
        // Clear previous QR code
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Generate new QR code
        const qr = new QRCode({
            content: currentUrl,
            padding: 4,
            width: 200,
            height: 200,
            color: {
                dark: '#4E54C8',
                light: '#FFFFFF'
            },
            ecl: 'M'
        });
        
        // Draw QR code to canvas
        const qrSvg = qr.svg();
        const img = new Image();
        img.onload = function() {
            ctx.drawImage(img, 0, 0, 200, 200);
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(qrSvg);
        
        console.log('✅ QR Code generated successfully');
    } else {
        console.error('❌ QR Code library not available');
        showNotification('Erreur: Bibliothèque QR Code non disponible', 'error');
    }
    
    // Add download functionality
    const downloadBtn = document.getElementById('downloadQRBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'lucky-spin-qr-code.png';
                a.click();
                URL.revokeObjectURL(url);
                showNotification('📱 QR Code téléchargé!', 'success');
            });
        };
    }
}

// Create winners chart
function createWinnersChart() {
    const ctx = elements.winnersChart.getContext('2d');
    
    // Group winners by date
    const winnersByDate = {};
    state.winners.forEach(winner => {
        const date = new Date(winner.winDate).toLocaleDateString();
        winnersByDate[date] = (winnersByDate[date] || 0) + 1;
    });
    
    const dates = Object.keys(winnersByDate);
    const counts = Object.values(winnersByDate);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Gagnants par jour',
                data: counts,
                borderColor: '#4e54c8',
                backgroundColor: 'rgba(78, 84, 200, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update roulette size
function updateRouletteSize() {
    const container = document.querySelector('.roulette-container');
    const canvas = elements.rouletteCanvas;
    
    container.style.width = `${state.rouletteSize}px`;
    container.style.height = `${state.rouletteSize}px`;
    canvas.width = state.rouletteSize;
    canvas.height = state.rouletteSize;
    
    drawRoulette();
}

// Update volume
function updateVolume() {
    // Update volume for all sounds
    Object.values(sounds).forEach(sound => {
        if (sound && sound.volume !== undefined) {
            sound.volume = state.masterVolume / 100;
        }
    });
}

// Update slider value display
function updateSliderValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = value;
        element.style.background = `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`;
        element.style.color = 'white';
        element.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
}

// Reset application
function resetApplication() {
    Swal.fire({
        title: 'Êtes-vous sûr?',
        text: "Tous les participants et l'historique seront effacés!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Oui, réinitialiser!',
        cancelButtonText: 'Annuler',
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
    }).then((result) => {
        if (result.isConfirmed) {
            state.participants = [];
            state.winners = [];
            rotation = 0;
            
            updateUI();
            drawRoulette();
            saveToLocalStorage();
            
            Swal.fire(
                'Réinitialisé!',
                'L\'application a été réinitialisée.',
                'success'
            );
        }
    });
}

// Show help
function showHelp() {
    Swal.fire({
        title: 'Comment utiliser LuckySpin',
        html: `
            <ol class="text-start">
                <li>Ajoutez des participants manuellement ou importez un fichier CSV</li>
                <li>Cliquez sur "Lancer la roulette" pour tirer au sort un gagnant</li>
                <li>Les résultats sont sauvegardés automatiquement</li>
                <li>Utilisez le bouton de thème pour changer l'apparence</li>
                <li>Exportez ou partagez les résultats via les boutons dédiés</li>
            </ol>
        `,
        icon: 'info',
        confirmButtonText: 'Compris!',
        background: getComputedStyle(document.documentElement).getPropertyValue('--card-bg'),
        color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
    });
}

// Update UI based on state
function updateUI() {
    updateParticipantsList();
    updateWinnersList();
    updateParticipantCount();
    updateSpinButton();
    updateLiveStats();
}

// Update participants list ULTRA
function updateParticipantsList() {
    elements.participantsList.innerHTML = '';
    
    if (state.participants.length === 0) {
        elements.participantsList.innerHTML = `
            <div class="text-center p-3 text-muted">
                <span class="emoji-bounce">👥</span>
                <p class="mt-2">Aucun participant</p>
                <small class="text-muted">Ajoutez des participants pour commencer!</small>
            </div>
        `;
        return;
    }
    
    state.participants.forEach((participant, index) => {
        const li = document.createElement('div');
        li.className = 'list-group-item animate__animated animate__fadeIn';
        li.style.animationDelay = `${index * 0.1}s`;
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="emoji me-2">${participant.emoji || '👤'}</span>
                <span class="participant-name">${participant.name}</span>
            </div>
            <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${participant.id}" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elements.participantsList.appendChild(li);
        
        // Add event listener to delete button
        li.querySelector('.delete-btn').addEventListener('click', () => {
            if (state.animationsEnabled) {
                li.classList.add('animate__animated', 'animate__shakeX');
                setTimeout(() => {
                    removeParticipant(participant.id);
                }, 500);
            } else {
                removeParticipant(participant.id);
            }
        });
    });
}

// Update winners list ULTRA
function updateWinnersList() {
    elements.winnersList.innerHTML = '';
    
    if (state.winners.length === 0) {
        elements.winnersList.innerHTML = `
            <div class="text-center p-3 text-muted">
                <span class="emoji-bounce">🏆</span>
                <p class="mt-2">Aucun gagnant encore</p>
                <small class="text-muted">Lancez la roulette pour désigner un gagnant!</small>
            </div>
        `;
        return;
    }
    
    state.winners.slice(0, 10).forEach((winner, index) => {
        const li = document.createElement('div');
        li.className = 'list-group-item animate__animated animate__bounceIn';
        li.style.animationDelay = `${index * 0.1}s`;
        li.innerHTML = `
            <div class="d-flex align-items-center">
                <span class="emoji me-2">${winner.emoji || '👑'}</span>
            <div>
                <strong class="text-success">${winner.name}</strong>
                    <div class="small text-muted">
                        <i class="fas fa-calendar me-1"></i>
                        ${new Date(winner.winDate).toLocaleDateString()}
                        <i class="fas fa-clock ms-2 me-1"></i>
                        ${new Date(winner.winDate).toLocaleTimeString()}
            </div>
                </div>
            </div>
            <div class="d-flex align-items-center">
                <span class="badge bg-success rounded-pill me-2">#${index + 1}</span>
                <span class="badge bg-warning rounded-pill">🏆 Gagnant</span>
            </div>
        `;
        elements.winnersList.appendChild(li);
    });
}

// Update participant count
function updateParticipantCount() {
    elements.participantCount.textContent = state.participants.length;
}

// Update spin button state
function updateSpinButton() {
    if (elements.spinButton) {
    elements.spinButton.disabled = state.participants.length < 2 || state.isSpinning;
        
        // Update button text based on state
        if (state.participants.length < 2) {
            elements.spinButton.innerHTML = '<i class="fas fa-plus me-2"></i>➕ Ajoutez des participants';
        } else if (state.isSpinning) {
            elements.spinButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>🎡 En cours...';
        } else {
            elements.spinButton.innerHTML = '<i class="fas fa-play-circle me-2"></i>🚀 Lancer la Magie !';
        }
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = `
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
    `;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Save to localStorage ULTRA
function saveToLocalStorage() {
    const data = {
        participants: state.participants,
        winners: state.winners,
        currentTheme: state.currentTheme,
        soundsEnabled: state.soundsEnabled,
        animationsEnabled: state.animationsEnabled,
        confettiEnabled: state.confettiEnabled,
        hapticEnabled: state.hapticEnabled,
        rotationSpeed: state.rotationSpeed,
        spinDuration: state.spinDuration,
        masterVolume: state.masterVolume,
        effectsVolume: state.effectsVolume,
        rouletteColor: state.rouletteColor,
        rouletteSize: state.rouletteSize,
        totalSpins: state.totalSpins,
        statistics: state.statistics
    };
    
    localStorage.setItem('luckySpinData', JSON.stringify(data));
}

// Load from localStorage ULTRA
function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('luckySpinData'));
    
    if (data) {
        state.participants = data.participants || [];
        state.winners = data.winners || [];
        state.currentTheme = data.currentTheme || 'light';
        state.soundsEnabled = data.soundsEnabled !== undefined ? data.soundsEnabled : true;
        state.animationsEnabled = data.animationsEnabled !== undefined ? data.animationsEnabled : true;
        state.confettiEnabled = data.confettiEnabled !== undefined ? data.confettiEnabled : true;
        state.hapticEnabled = data.hapticEnabled !== undefined ? data.hapticEnabled : false;
        state.rotationSpeed = data.rotationSpeed || 5;
        state.spinDuration = data.spinDuration || 4;
        state.masterVolume = data.masterVolume || 70;
        state.effectsVolume = data.effectsVolume || 80;
        state.rouletteColor = data.rouletteColor || '#4e54c8';
        state.rouletteSize = data.rouletteSize || 400;
        state.totalSpins = data.totalSpins || 0;
        state.statistics = data.statistics || {
            totalParticipants: 0,
            totalWinners: 0,
            totalSpins: 0,
            avgSpinTime: 0,
            spinTimes: []
        };
        
        // Apply theme
        document.body.setAttribute('data-theme', state.currentTheme);
        
        // Add emojis to existing participants if they don't have them
        state.participants.forEach(participant => {
            if (!participant.emoji) {
                participant.emoji = getRandomEmoji();
            }
        });
        
        // Add emojis to existing winners if they don't have them
        state.winners.forEach(winner => {
            if (!winner.emoji) {
                winner.emoji = getRandomEmoji();
            }
        });
        
        // Update settings toggles
        if (elements.soundToggle) elements.soundToggle.checked = state.soundsEnabled;
        if (elements.animationsToggle) elements.animationsToggle.checked = state.animationsEnabled;
        if (elements.confettiToggle) elements.confettiToggle.checked = state.confettiEnabled;
        if (elements.hapticToggle) elements.hapticToggle.checked = state.hapticEnabled;
        if (elements.rotationSpeed) {
        elements.rotationSpeed.value = state.rotationSpeed;
            updateSliderValue('rotationSpeedValue', state.rotationSpeed);
        }
        if (elements.spinDuration) {
            elements.spinDuration.value = state.spinDuration;
            updateSliderValue('spinDurationValue', state.spinDuration + 's');
        }
        if (elements.rouletteColor) elements.rouletteColor.value = state.rouletteColor;
        if (elements.rouletteSize) elements.rouletteSize.value = state.rouletteSize;
        if (elements.masterVolume) elements.masterVolume.value = state.masterVolume;
        if (elements.effectsVolume) elements.effectsVolume.value = state.effectsVolume;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);