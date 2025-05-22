// Neural Nostalgia Player - Main JavaScript
import ApiService from './apiService.js';
import CONFIG from './config.js';

// DOM Elements
const memoryInputSection = document.getElementById('memoryInput');
const generatedResultSection = document.getElementById('generatedResult');
const memoriesGallerySection = document.getElementById('memoriesGallery');
const memoryTextarea = document.getElementById('memoryText');
const generateBtn = document.getElementById('generateBtn');
const exampleBtns = document.querySelectorAll('.example-btn');
const loadingMessage = document.getElementById('loadingMessage');
const memoryTitle = document.getElementById('memoryTitle');
const memoryDate = document.getElementById('memoryDate');
const memoryDescription = document.getElementById('memoryDescription');
const backgroundImage = document.getElementById('backgroundImage');
const audioPlayer = new Audio();
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const rewindBtn = document.getElementById('rewindBtn');
const saveMemoryBtn = document.getElementById('saveMemoryBtn');
const shareMemoryBtn = document.getElementById('shareMemoryBtn');
const backBtn = document.getElementById('backBtn');
const memoriesContainer = document.getElementById('memoriesContainer');
const clearGalleryBtn = document.getElementById('clearGalleryBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');
const aboutBtn = document.getElementById('aboutBtn');
const settingsBtn = document.getElementById('settingsBtn');
const galleryBtn = document.getElementById('galleryBtn');
const aboutModal = document.getElementById('aboutModal');
const settingsModal = document.getElementById('settingsModal');
const modalCloseBtns = document.querySelectorAll('.close-btn');
const currentYearSpan = document.getElementById('currentYear');
const apiKeyInput = document.getElementById('apiKeyInput');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const resetSettingsBtn = document.getElementById('resetSettingsBtn');
const vhsEffectToggle = document.getElementById('vhsEffectToggle');
const audioVisualizerToggle = document.getElementById('audioVisualizerToggle');
const customCursorToggle = document.getElementById('customCursorToggle');
const highQualityToggle = document.getElementById('highQualityToggle');
const vhsOverlay = document.querySelector('.vhs-overlay');
const vhsFilter = document.querySelector('.vhs-filter');
const vhsNotification = document.getElementById('vhsNotification');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const rewindOverlay = document.getElementById('rewindOverlay');
const customCursor = document.querySelector('.custom-cursor');
const customCursorDot = document.querySelector('.custom-cursor-dot');
const screenTransition = document.querySelector('.screen-transition');
const audioVisualizer = document.querySelector('.audio-visualizer');
const visualizerCanvas = document.getElementById('visualizerCanvas');

// State management
let currentMemory = null;
let audioContext = null;
let analyser = null;
let dataArray = null;
let isPlaying = false;
let isRewinding = false;
let isAudioVisualizerActive = true;
let isCustomCursorActive = true;
let isVHSEffectActive = true;
let isFullscreen = false;
let animationFrameId = null;
let savedMemories = JSON.parse(localStorage.getItem('neuralNostalgiaMemories')) || [];
let konamiCodeSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiCodePosition = 0;

// Initialize the application
function init() {
    // Apply settings from localStorage
    loadSettings();
    
    // Update current year in footer
    currentYearSpan.textContent = new Date().getFullYear();
    
    // Setup event listeners
    setupEventListeners();
    
    // Setup Konami code easter egg
    document.addEventListener('keydown', checkKonamiCode);
    
    // Initialize custom cursor
    if (isCustomCursorActive && window.innerWidth > 768) {
        initCustomCursor();
    }
    
    // Initialize audio context for visualizer
    setupAudioContext();
}

// Load settings from localStorage
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('neuralNostalgiaSettings')) || {};
    
    if (settings.apiKey) {
        apiKeyInput.value = settings.apiKey;
        CONFIG.API_KEY = settings.apiKey;
    }
    
    isVHSEffectActive = settings.vhsEffect !== undefined ? settings.vhsEffect : true;
    isAudioVisualizerActive = settings.audioVisualizer !== undefined ? settings.audioVisualizer : true;
    isCustomCursorActive = settings.customCursor !== undefined ? settings.customCursor : true;
    CONFIG.HIGH_QUALITY = settings.highQuality !== undefined ? settings.highQuality : false;
    
    // Update UI based on settings
    vhsEffectToggle.checked = isVHSEffectActive;
    audioVisualizerToggle.checked = isAudioVisualizerActive;
    customCursorToggle.checked = isCustomCursorActive;
    highQualityToggle.checked = CONFIG.HIGH_QUALITY;
    
    // Apply VHS effect based on settings
    if (!isVHSEffectActive) {
        vhsOverlay.style.display = 'none';
        if (vhsFilter) vhsFilter.style.display = 'none';
    }
    
    // Apply audio visualizer based on settings
    if (!isAudioVisualizerActive) {
        audioVisualizer.style.display = 'none';
    }
}

// Save settings to localStorage
function saveSettings() {
    const settings = {
        apiKey: apiKeyInput.value,
        vhsEffect: vhsEffectToggle.checked,
        audioVisualizer: audioVisualizerToggle.checked,
        customCursor: customCursorToggle.checked,
        highQuality: highQualityToggle.checked
    };
    
    localStorage.setItem('neuralNostalgiaSettings', JSON.stringify(settings));
    
    // Update CONFIG
    CONFIG.API_KEY = apiKeyInput.value;
    CONFIG.HIGH_QUALITY = highQualityToggle.checked;
    
    // Update state variables
    isVHSEffectActive = vhsEffectToggle.checked;
    isAudioVisualizerActive = audioVisualizerToggle.checked;
    isCustomCursorActive = customCursorToggle.checked;
    
    // Apply settings immediately
    applySettings();
    
    // Show notification
    showNotification('Settings saved successfully');
}

// Apply settings changes immediately
function applySettings() {
    // Apply VHS effect based on settings
    vhsOverlay.style.display = isVHSEffectActive ? 'block' : 'none';
    if (vhsFilter) vhsFilter.style.display = isVHSEffectActive ? 'block' : 'none';
    
    // Apply audio visualizer based on settings
    audioVisualizer.style.display = isAudioVisualizerActive ? 'block' : 'none';
    if (isAudioVisualizerActive && isPlaying) {
        startAudioVisualization();
    } else {
        stopAudioVisualization();
    }
    
    // Apply custom cursor based on settings
    if (isCustomCursorActive && window.innerWidth > 768) {
        enableCustomCursor();
    } else {
        disableCustomCursor();
    }
}

// Reset settings to default
function resetSettings() {
    apiKeyInput.value = '';
    vhsEffectToggle.checked = true;
    audioVisualizerToggle.checked = true;
    customCursorToggle.checked = true;
    highQualityToggle.checked = false;
    
    saveSettings();
}

// Setup event listeners
function setupEventListeners() {
    // Generate Memory button
    generateBtn.addEventListener('click', generateMemory);
    
    // Example memory buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            memoryTextarea.value = btn.dataset.memory;
            generateMemory();
        });
    });
    
    // Audio controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    if (rewindBtn) rewindBtn.addEventListener('click', rewindAudio);
    
    // Add fast forward and loop functionality if elements exist
    const fastForwardBtn = document.getElementById('fastForwardBtn');
    if (fastForwardBtn) {
        fastForwardBtn.addEventListener('click', fastForwardAudio);
    }
    
    const loopBtn = document.getElementById('loopBtn');
    if (loopBtn) {
        loopBtn.addEventListener('click', toggleLoop);
    }
    
    audioPlayer.addEventListener('timeupdate', updateProgressBar);
    audioPlayer.addEventListener('ended', () => {
        if (!audioPlayer.loop) {
            isPlaying = false;
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
            stopAudioVisualization();
        }
    });
    
    // Progress bar seeking
    const progressContainer = document.querySelector('.progress-container');
    if (progressContainer) {
        progressContainer.addEventListener('click', seekAudio);
    }
    
    // Memory actions
    if (saveMemoryBtn) saveMemoryBtn.addEventListener('click', saveMemory);
    const shareMemoryBtn = document.getElementById('shareMemoryBtn');
    if (shareMemoryBtn) {
        shareMemoryBtn.addEventListener('click', shareMemory);
    }
    
    const newMemoryBtn = document.getElementById('newMemoryBtn');
    if (newMemoryBtn) {
        newMemoryBtn.addEventListener('click', () => {
            showSection(memoryInputSection);
        });
    }
    
    // Gallery actions
    const clearMemoriesBtn = document.getElementById('clearMemoriesBtn');
    if (clearMemoriesBtn) {
        clearMemoriesBtn.addEventListener('click', clearMemories);
    }
    
    const backToMainBtn = document.getElementById('backToMainBtn');
    if (backToMainBtn) {
        backToMainBtn.addEventListener('click', () => {
            showSection(memoryInputSection);
        });
    }
    
    // Footer links
    if (aboutBtn) aboutBtn.addEventListener('click', () => {
        aboutModal.style.display = 'block';
    });
    
    if (settingsBtn) settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
    });
    
    // Gallery navigation
    const galleryBtn = document.getElementById('galleryBtn');
    if (galleryBtn) {
        galleryBtn.addEventListener('click', () => {
            loadMemoriesGallery();
            showSection(memoriesGallerySection);
        });
    }
    
    // Modal close buttons
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            modal.style.display = 'none';
        });
    });
    
    // Settings controls
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Fullscreen button
    if (fullscreenBtn) fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Konami code
    document.addEventListener('keydown', checkKonamiCode);
}
    });
    
    // Memory actions
    saveMemoryBtn.addEventListener('click', saveMemory);
    shareMemoryBtn.addEventListener('click', shareMemory);
    backBtn.addEventListener('click', () => showSection(memoryInputSection));
    
    // Gallery actions
    galleryBtn.addEventListener('click', () => {
        loadGallery();
        showSection(memoriesGallerySection);
    });
    clearGalleryBtn.addEventListener('click', clearGallery);
    backToHomeBtn.addEventListener('click', () => showSection(memoryInputSection));
    
    // Modal controls
    aboutBtn.addEventListener('click', () => aboutModal.style.display = 'block');
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'block');
    modalCloseBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            aboutModal.style.display = 'none';
            settingsModal.style.display = 'none';
        });
    });
    
    // Settings actions
    saveSettingsBtn.addEventListener('click', saveSettings);
    resetSettingsBtn.addEventListener('click', resetSettings);
    
    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Progress bar click to seek
    document.querySelector('.progress-container').addEventListener('click', seekAudio);
}

// Initialize custom cursor
function initCustomCursor() {
    document.addEventListener('mousemove', (e) => {
        if (isCustomCursorActive) {
            customCursor.style.left = e.clientX + 'px';
            customCursor.style.top = e.clientY + 'px';
            customCursorDot.style.left = e.clientX + 'px';
            customCursorDot.style.top = e.clientY + 'px';
        }
    });
    
    document.addEventListener('mousedown', () => {
        if (isCustomCursorActive) customCursor.classList.add('active');
    });
    
    document.addEventListener('mouseup', () => {
        if (isCustomCursorActive) customCursor.classList.remove('active');
    });
    
    // Add class to interactive elements to change cursor appearance
    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .memories-container');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (isCustomCursorActive) customCursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            if (isCustomCursorActive) customCursor.classList.remove('hover');
        });
    });
}

function enableCustomCursor() {
    document.body.style.cursor = 'none';
    customCursor.style.display = 'block';
    customCursorDot.style.display = 'block';
}

function disableCustomCursor() {
    document.body.style.cursor = 'auto';
    customCursor.style.display = 'none';
    customCursorDot.style.display = 'none';
}

// Setup audio context for visualizer
function setupAudioContext() {
    try {
        // Create audio context
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // Create buffer for frequency data
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        // Connect audio element to audio context
        const source = audioContext.createMediaElementSource(audioPlayer);
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        console.log('Audio context setup successful');
    } catch (error) {
        console.error('Error setting up audio context:', error);
        isAudioVisualizerActive = false;
    }
}

// Start audio visualization
function startAudioVisualization() {
    if (!isAudioVisualizerActive) return;
    
    const canvas = visualizerCanvas;
    const canvasCtx = canvas.getContext('2d');
    
    // Ensure canvas dimensions match its display size
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    function draw() {
        if (!isAudioVisualizerActive) return;
        
        animationFrameId = requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / dataArray.length) * 2.5;
        let barHeight;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] / 2.5;
            
            const r = barHeight + 25 * (i/dataArray.length);
            const g = 250 * (i/dataArray.length);
            const b = 255;
            
            canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    draw();
}

// Stop audio visualization
function stopAudioVisualization() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

// Toggle fullscreen mode
function toggleFullscreen() {
    if (!isFullscreen) {
        const docEl = document.documentElement;
        
        if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
        } else if (docEl.mozRequestFullScreen) { // Firefox
            docEl.mozRequestFullScreen();
        } else if (docEl.webkitRequestFullscreen) { // Chrome, Safari and Opera
            docEl.webkitRequestFullscreen();
        } else if (docEl.msRequestFullscreen) { // IE/Edge
            docEl.msRequestFullscreen();
        }
        
        fullscreenBtn.classList.add('active');
        isFullscreen = true;
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
        
        fullscreenBtn.classList.remove('active');
        isFullscreen = false;
    }
}

// Show VHS notification
function showNotification(message) {
    vhsNotification.textContent = message;
    vhsNotification.classList.add('show');
    
    setTimeout(() => {
        vhsNotification.classList.remove('show');
    }, 3000);
}

// Screen transition effect
function screenTransition(callback) {
    screenTransition.classList.add('active');
    
    setTimeout(() => {
        if (callback) callback();
        
        setTimeout(() => {
            screenTransition.classList.remove('active');
        }, 400);
    }, 600);
}

// Switch between sections
function showSection(section) {
    // Pause audio if playing
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        stopAudioVisualization();
    }
    
    // Add screen transition effect
    screenTransition.classList.add('active');
    
    setTimeout(() => {
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        section.classList.add('active');
        
        setTimeout(() => {
            screenTransition.classList.remove('active');
        }, 400);
    }, 600);
}

// Create a title from the image prompt
function createTitleFromPrompt(prompt) {
    // Extract first phrase or sentence
    let title = prompt.split(/[,.;:]/)[0];
    
    // Capitalize first letter of each word
    title = title.replace(/\b\w/g, c => c.toUpperCase());
    
    // Trim to reasonable length
    if (title.length > 40) {
        title = title.substring(0, 37) + '...';
    }
    
    return title;
}

// Generate random tape number
function generateRandomTapeNumber() {
    return Math.floor(Math.random() * 900 + 100).toString();
}

// Generate memory experience
async function generateMemory() {
    const memoryText = memoryTextarea.value.trim();
    
    if (!memoryText) {
        showNotification('Please enter a memory description');
        return;
    }
    
    // Show loading screen
    showSection(document.getElementById('loadingScreen'));
    
    // Update loading message
    loadingMessage.textContent = 'Interpreting memory...';
    
    try {
        // Step 1: Generate prompts from memory
        const prompts = await ApiService.generatePrompts(memoryText);
        loadingMessage.textContent = 'Generating nostalgic scene...';
        
        // Step 2: Generate image based on image prompt
        const imageUrl = await ApiService.generateImage(prompts.imagePrompt);
        loadingMessage.textContent = 'Creating soundscape...';
        
        // Step 3: Generate audio based on music prompt
        const audioUrl = await ApiService.generateMusic(prompts.musicPrompt);
        loadingMessage.textContent = 'Finalizing your experience...';
        
        // Create memory object
        const memory = {
            id: Date.now().toString(),
            title: createTitleFromPrompt(prompts.imagePrompt),
            date: prompts.date,
            description: memoryText,
            imageSrc: imageUrl,
            audioSrc: audioUrl,
            tapeNumber: generateRandomTapeNumber()
        };
        
        // Display the created memory
        setTimeout(() => {
            displayMemory(memory);
            showSection(generatedResultSection);
        }, 1000);
        
    } catch (error) {
        console.error('Error generating memory:', error);
        loadingMessage.textContent = 'Something went wrong. Using fallback content...';
        
        // Fallback to mock memory if API fails
        setTimeout(() => {
            const mockMemory = createMockMemory(memoryText);
            displayMemory(mockMemory);
            showSection(generatedResultSection);
        }, 1500);
    }
}

// Create a mock memory (temporary function until API is integrated)
function createMockMemory(memoryText) {
    // Process the memory text to extract a title
    let title = memoryText.split(',')[0];
    if (title.length > 40) {
        title = title.substring(0, 40) + '...';
    }
    
    // Extract a year if present, otherwise use random year from 1980-2010
    const yearMatch = memoryText.match(/\b(19\d\d|20[0-1]\d)\b/);
    const year = yearMatch ? yearMatch[0] : (1980 + Math.floor(Math.random() * 30)).toString();
    
    // Generate a date within that year
    const month = Math.floor(Math.random() * 12) + 1;
    const day = Math.floor(Math.random() * 28) + 1;
    const formattedDate = `${month}/${day}/${year}`;
    
    // For testing, use placeholder image - will be replaced with API-generated content
    const imageSrc = 'https://picsum.photos/800/500?random=' + Math.random();
    
    // For testing, use placeholder audio - will be replaced with API-generated content
    // Using a royalty-free ambient track for demonstration
    const audioSrc = 'https://audio.jukehost.co.uk/SjCDqDd17jlTi53QXTZ0xRpFCXSQQPTG';
    
    return {
        id: Date.now().toString(),
        title: title,
        date: formattedDate,
        description: memoryText,
        imageSrc: imageSrc,
        audioSrc: audioSrc
    };
}

// Display memory in result section
function displayMemory(memory) {
    currentMemory = memory;
    
    memoryTitle.textContent = memory.title;
    memoryDate.textContent = memory.date;
    memoryDescription.textContent = memory.description;
    backgroundImage.src = memory.imageSrc;
    audioPlayer.src = memory.audioSrc;
    
    // Reset playback state
    isPlaying = false;
    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    progressBar.style.width = '0%';
    
    // Preload audio
    audioPlayer.load();
}

// Toggle play/pause
function togglePlayPause() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (isPlaying) {
        audioPlayer.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        stopAudioVisualization();
    } else {
        audioPlayer.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        startAudioVisualization();
    }
    
    isPlaying = !isPlaying;
}

// Update progress bar
function updateProgressBar() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = progress + '%';
}

// Seek audio position
function seekAudio(e) {
    const progressContainer = document.querySelector('.progress-container');
    const rect = progressContainer.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    
    audioPlayer.currentTime = pos * audioPlayer.duration;
    updateProgressBar();
}

// Rewind audio with VHS effect
function rewindAudio() {
    if (isRewinding) return;
    
    isRewinding = true;
    rewindOverlay.classList.add('active');
    
    // Add VHS tracking issues
    vhsFilter.classList.add('tracking-issue');
    
    // Pause audio if playing
    if (isPlaying) {
        audioPlayer.pause();
        stopAudioVisualization();
    }
    
    // Simulate rewinding with decreasing audio currentTime
    const rewindInterval = setInterval(() => {
        if (audioPlayer.currentTime <= 0) {
            clearInterval(rewindInterval);
            finishRewinding();
            return;
        }
        
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 1);
        updateProgressBar();
    }, 50);
    
    // Safety timeout in case rewind takes too long
    setTimeout(() => {
        if (isRewinding) {
            clearInterval(rewindInterval);
            finishRewinding();
        }
    }, 3000);
}

// Finish rewinding
function finishRewinding() {
    audioPlayer.currentTime = 0;
    updateProgressBar();
    
    // Reset state
    isRewinding = false;
    
    // Hide rewind overlay with a slight delay
    setTimeout(() => {
        rewindOverlay.classList.remove('active');
        vhsFilter.classList.remove('tracking-issue');
        
        // If it was playing before rewind, resume playback
        if (isPlaying) {
            audioPlayer.play();
            startAudioVisualization();
        }
    }, 500);
}

// Save current memory to gallery
function saveMemory() {
    if (!currentMemory) {
        showNotification('No memory to save');
        return;
    }
    
    // Check if memory already exists in saved memories
    if (savedMemories.some(memory => memory.id === currentMemory.id)) {
        showNotification('This memory is already saved');
        return;
    }
    
    // Add to saved memories
    savedMemories.push(currentMemory);
    
    // Save to localStorage
    localStorage.setItem('neuralNostalgiaMemories', JSON.stringify(savedMemories));
    
    // Show confirmation
    showNotification('Memory saved to gallery');
    
    // Update gallery if it's currently shown
    if (memoriesGallerySection.classList.contains('active')) {
        loadMemoriesGallery();
    }
}

// Load saved memories into gallery
function loadMemoriesGallery() {
    const memoriesList = document.getElementById('memoriesList');
    memoriesList.innerHTML = '';
    
    if (savedMemories.length === 0) {
        memoriesList.innerHTML = '<p class="empty-gallery">No saved memories yet. Generate and save memories to see them here.</p>';
        return;
    }
    
    // Create memory cards for each saved memory
    savedMemories.forEach(memory => {
        const memoryCard = document.createElement('div');
        memoryCard.className = 'memory-card';
        memoryCard.innerHTML = `
            <div class="memory-card-image" style="background-image: url('${memory.imageSrc}')"></div>
            <div class="memory-card-info">
                <h3>${memory.title}</h3>
                <p class="memory-date">${memory.date}</p>
            </div>
        `;
        
        // Add click event to load this memory
        memoryCard.addEventListener('click', () => {
            displayMemory(memory);
            showSection(generatedResultSection);
        });
        
        memoriesList.appendChild(memoryCard);
    });
}

// Clear all saved memories
function clearMemories() {
    if (confirm('Are you sure you want to clear all saved memories? This cannot be undone.')) {
        savedMemories = [];
        localStorage.removeItem('neuralNostalgiaMemories');
        loadMemoriesGallery();
        showNotification('All memories cleared');
    }
}

// Konami code easter egg
function checkKonamiCode(e) {
    // Check if the key pressed matches the next key in the sequence
    if (e.key === konamiCodeSequence[konamiCodePosition]) {
        konamiCodePosition++;
        
        // If the full sequence is entered
        if (konamiCodePosition === konamiCodeSequence.length) {
            activateEasterEgg();
            konamiCodePosition = 0;
        }
    } else {
        konamiCodePosition = 0;
    }
}

// Activate Easter Egg
function activateEasterEgg() {
    // Flashy screen effect
    document.body.classList.add('easter-egg-active');
    
    // Show 80s-themed notification
    showNotification('RADICAL! EASTER EGG ACTIVATED!');
    
    // Add dev mode with special features
    document.body.classList.toggle('dev-mode');
    
    setTimeout(() => {
        document.body.classList.remove('easter-egg-active');
    }, 1000);
}

// Toggle loop mode
function toggleLoop() {
    audioPlayer.loop = !audioPlayer.loop;
    const loopBtn = document.getElementById('loopBtn');
    if (loopBtn) {
        if (audioPlayer.loop) {
            loopBtn.classList.add('active');
        } else {
            loopBtn.classList.remove('active');
        }
    }
}

// Fast forward audio
function fastForwardAudio() {
    if (isRewinding) return;
    
    // Skip forward 10 seconds
    audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    
    // Update progress bar
    updateProgressBar();
    
    // Add VHS tracking issue effect
    if (vhsFilter) {
        vhsFilter.classList.add('tracking-issue');
        setTimeout(() => {
            vhsFilter.classList.remove('tracking-issue');
        }, 500);
    }
}

// Share memory
function shareMemory() {
    if (!currentMemory) {
        showNotification('No memory to share');
        return;
    }
    
    // Generate share text
    const shareText = `Check out my nostalgic memory: "${currentMemory.title}" created with Neural Nostalgia Player`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: 'Neural Nostalgia Memory',
            text: shareText,
            url: window.location.href
        })
        .then(() => showNotification('Shared successfully'))
        .catch((error) => {
            console.error('Error sharing:', error);
            showNotification('Could not share memory');
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText + ' ' + window.location.href)
            .then(() => showNotification('Share text copied to clipboard'))
            .catch(() => showNotification('Could not copy share text'));
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);