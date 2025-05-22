// Neural Nostalgia Player - Full API Integration Version
import CONFIG from './config.js';
import ApiService from './apiService.js';

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {    // DOM Elements
    const memoryInputSection = document.getElementById('memoryInput');
    const loadingScreen = document.getElementById('loadingScreen');
    const generatedResultSection = document.getElementById('generatedResult');
    const memoriesGallerySection = document.getElementById('memoriesGallery');
    const memoryTextarea = document.getElementById('memoryText');
    const generateBtn = document.getElementById('generateBtn');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const loadingMessage = document.getElementById('loadingMessage');
    
    // Audio Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.getElementById('progressBar');
    
    // Buttons and controls
    const saveMemoryBtn = document.getElementById('saveMemoryBtn');
    const shareMemoryBtn = document.getElementById('shareMemoryBtn');
    const newMemoryBtn = document.getElementById('newMemoryBtn');
    const clearMemoriesBtn = document.getElementById('clearMemoriesBtn');
    const backToMainBtn = document.getElementById('backToMainBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const aboutModal = document.getElementById('aboutModal');
    const settingsModal = document.getElementById('settingsModal');
    const modalCloseBtns = document.querySelectorAll('.close-btn');
    
    // Settings elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const replicateApiKeyInput = document.getElementById('replicateApiKeyInput');
    const useRealPrompts = document.getElementById('useRealPrompts');
    const useRealImages = document.getElementById('useRealImages');
    const useRealMusic = document.getElementById('useRealMusic');
    const enhancedEffects = document.getElementById('enhancedEffects');
    const showVisualizer = document.getElementById('showVisualizer');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    
    // Audio visualizer elements
    const audioVisualizer = document.getElementById('audioVisualizer');
    const visualizerCanvas = document.getElementById('visualizerCanvas');
    
    // State variables
    let currentMemory = null;
    let isPlaying = false;
    let savedMemories = JSON.parse(localStorage.getItem('neuralNostalgiaMemories')) || [];
    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationFrameId = null;
    
    // Init
    initialize();
      function initialize() {
        // Load saved settings
        loadSettings();
        
        // Setup event listeners
        setupEventListeners();
        
        // Setup audio context for visualizer
        setupAudioContext();
        
        // Setup VHS effects
        setupVhsEffects();
        
        // Show input section by default
        showSection(memoryInputSection);
        
        // Set current year in footer
        const currentYearSpan = document.getElementById('currentYear');
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }
        
        console.log('Neural Nostalgia Player initialized');
    }    // Load settings from localStorage
    function loadSettings() {
        const settings = JSON.parse(localStorage.getItem('neuralNostalgiaSettings')) || {};
        
        // Update toggles to match saved settings
        if (enhancedEffects) enhancedEffects.checked = settings.enhancedEffects !== false;
        if (showVisualizer) showVisualizer.checked = settings.showVisualizer !== false;
        
        // Apply settings
        if (audioVisualizer && settings.showVisualizer === false) {
            audioVisualizer.style.display = 'none';
        }
        
        console.log('Settings loaded');
    }// Save settings to localStorage
    function saveSettings() {
        const settings = {
            enhancedEffects: enhancedEffects ? enhancedEffects.checked : true,
            showVisualizer: showVisualizer ? showVisualizer.checked : true
        };
        
        localStorage.setItem('neuralNostalgiaSettings', JSON.stringify(settings));
        
        // Apply settings
        if (audioVisualizer) {
            audioVisualizer.style.display = settings.showVisualizer ? 'block' : 'none';
        }
        
        // Show confirmation
        showNotification('Settings saved successfully');
        
        console.log('Settings saved:', settings);
    }
    
    // Setup audio context for visualizer
    function setupAudioContext() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            
            // Connect audio element to analyser
            if (audioPlayer) {
                const source = audioContext.createMediaElementSource(audioPlayer);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
            }
            
            console.log('Audio context initialized successfully');
        } catch (error) {
            console.error('Error setting up audio context:', error);
            if (showVisualizer) showVisualizer.checked = false;
        }
    }
    
    // Start audio visualization
    function startAudioVisualization() {
        if (!audioContext || !analyser || !dataArray || !visualizerCanvas || !showVisualizer?.checked) {
            return;
        }
        
        const canvasCtx = visualizerCanvas.getContext('2d');
        if (!canvasCtx) return;
        
        // Set canvas size
        visualizerCanvas.width = visualizerCanvas.clientWidth;
        visualizerCanvas.height = visualizerCanvas.clientHeight;
        
        function draw() {
            if (!isPlaying) return;
            
            animationFrameId = requestAnimationFrame(draw);
            
            analyser.getByteFrequencyData(dataArray);
            
            // Clear canvas
            canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
            
            // Draw visualizer bars
            const barWidth = (visualizerCanvas.width / dataArray.length) * 2.5;
            let x = 0;
            
            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = dataArray[i] / 2;
                
                // Creating a gradient effect
                const r = barHeight + 25 * (i/dataArray.length);
                const g = 200 * (i/dataArray.length);
                const b = 255;
                
                canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
                
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
    
    // Trigger random VHS effects
    function setupVhsEffects() {
        if (!CONFIG.FEATURES.enhancedVhsEffects) return;
        
        const vhsOverlay = document.querySelector('.vhs-overlay');
        const vhsRandomGlitch = document.querySelector('.vhs-random-glitch');
        const vhsTracking = document.querySelector('.vhs-tracking');
        const vhsTrackingLine = document.querySelector('.vhs-tracking-line');
        
        // Random tracking issues
        setInterval(() => {
            if (!vhsTracking || !enhancedEffects?.checked) return;
            
            vhsTracking.classList.add('active');
            setTimeout(() => {
                vhsTracking.classList.remove('active');
            }, 2000);
        }, CONFIG.VHS_EFFECTS.trackingIssueFrequency);
        
        // Random glitches
        setInterval(() => {
            if (!vhsRandomGlitch || !enhancedEffects?.checked) return;
            
            vhsRandomGlitch.classList.add('active');
            setTimeout(() => {
                vhsRandomGlitch.classList.remove('active');
            }, CONFIG.VHS_EFFECTS.glitchDuration);
        }, CONFIG.VHS_EFFECTS.randomGlitchFrequency);
        
        // Random tracking lines
        setInterval(() => {
            if (!vhsTrackingLine || !enhancedEffects?.checked) return;
            
            vhsTrackingLine.classList.add('active');
            setTimeout(() => {
                vhsTrackingLine.classList.remove('active');
            }, 800);
        }, CONFIG.VHS_EFFECTS.trackingIssueFrequency / 2);
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Generate Memory button
        if (generateBtn) {
            generateBtn.addEventListener('click', generateMemory);
        }
        
        // Example memory buttons
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                memoryTextarea.value = btn.dataset.memory;
                generateMemory();
            });
        });
        
        // Play/Pause button
        if (playPauseBtn) {
            playPauseBtn.addEventListener('click', togglePlayPause);
        }
        
        // Audio player events
        if (audioPlayer) {
            audioPlayer.addEventListener('timeupdate', updateProgressBar);
            audioPlayer.addEventListener('ended', function() {
                isPlaying = false;
                updatePlayPauseButton();
                stopAudioVisualization();
            });
        }
        
        // Memory actions
        if (saveMemoryBtn) {
            saveMemoryBtn.addEventListener('click', saveMemory);
        }
        
        if (shareMemoryBtn) {
            shareMemoryBtn.addEventListener('click', shareMemory);
        }
        
        if (newMemoryBtn) {
            newMemoryBtn.addEventListener('click', function() {
                showSection(memoryInputSection);
            });
        }
        
        // Gallery actions
        if (clearMemoriesBtn) {
            clearMemoriesBtn.addEventListener('click', clearMemories);
        }
        
        if (backToMainBtn) {
            backToMainBtn.addEventListener('click', function() {
                showSection(memoryInputSection);
            });
        }
        
        // Modal controls
        if (aboutBtn) {
            aboutBtn.addEventListener('click', function() {
                aboutModal.style.display = 'block';
            });
        }
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                settingsModal.style.display = 'block';
            });
        }
        
        modalCloseBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = btn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
        
        // Settings
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', saveSettings);
        }
        
        // Progress bar for seeking
        const progressContainer = document.querySelector('.progress-container');
        if (progressContainer) {
            progressContainer.addEventListener('click', seekAudio);
        }
    }
    
    // Generate memory with API integration
    async function generateMemory() {
        const memoryText = memoryTextarea.value.trim();
        
        if (!memoryText) {
            showNotification('Please enter a memory description');
            return;
        }
        
        // Show loading screen
        showSection(loadingScreen);
        
        try {
            // Step 1: Generate prompts from memory
            updateLoadingMessage('Interpreting memory...');
            const prompts = await ApiService.generatePrompts(memoryText);
            console.log('Generated prompts:', prompts);
            
            // Step 2: Generate image
            updateLoadingMessage('Creating nostalgic scene...');
            const imageUrl = await ApiService.generateImage(prompts.imagePrompt);
            
            // Step 3: Generate audio
            updateLoadingMessage('Composing soundscape...');
            const audioUrl = await ApiService.generateMusic(prompts.musicPrompt);
            
            // Prepare memory object
            const memory = {
                id: Date.now().toString(),
                title: createTitle(prompts.imagePrompt),
                date: prompts.date,
                description: memoryText,
                prompts: prompts, // Store original prompts for reference
                imageSrc: imageUrl,
                audioSrc: audioUrl,
                tapeNumber: generateTapeNumber()
            };
            
            updateLoadingMessage('Finalizing your nostalgic experience...');
            
            // Short delay for UI feedback
            setTimeout(() => {
                // Display memory and show result
                displayMemory(memory);
                showSection(generatedResultSection);
            }, 800);
            
        } catch (error) {
            console.error('Error generating memory:', error);
            
            // If error occurs, use fallback method
            updateLoadingMessage('AI connection issue. Creating fallback experience...');
            
            // Short delay for UI feedback
            setTimeout(() => {
                const memory = createFallbackMemory(memoryText);
                displayMemory(memory);
                showSection(generatedResultSection);
            }, 1500);
        }
    }
    
    // Update loading message
    function updateLoadingMessage(message) {
        if (loadingMessage) {
            loadingMessage.textContent = message;
        }
    }
    
    // Create fallback memory when API fails
    function createFallbackMemory(memoryText) {
        // Create a title from the memory text
        let title = memoryText.split(',')[0];
        if (title.length > 40) {
            title = title.substring(0, 40) + '...';
        }
        
        // Extract or generate a year
        const yearMatch = memoryText.match(/\b(19\d\d|20[0-1]\d)\b/);
        const year = yearMatch ? yearMatch[0] : (1980 + Math.floor(Math.random() * 30)).toString();
        
        // Generate a random date
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const formattedDate = `${month}/${day}/${year}`;
        
        // Use placeholder image and audio
        const imageSrc = 'https://picsum.photos/800/500?random=' + Math.random();
        const audioSrc = 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c9d257f491.mp3?filename=lofi-study-112191.mp3';
        
        return {
            id: Date.now().toString(),
            title: title,
            date: formattedDate,
            description: memoryText,
            imageSrc: imageSrc,
            audioSrc: audioSrc,
            tapeNumber: generateTapeNumber()
        };
    }
    
    // Create a title from prompt
    function createTitle(prompt) {
        // Take the first phrase/sentence
        let title = prompt.split(/[,.;:]/)[0];
        
        // Capitalize first letter of each word
        title = title.replace(/\b\w/g, c => c.toUpperCase());
        
        // Trim to reasonable length
        if (title.length > 40) {
            title = title.substring(0, 40) + '...';
        }
        
        return title;
    }
    
    // Generate unique tape number
    function generateTapeNumber() {
        return Math.floor(Math.random() * 900 + 100).toString();
    }
    
    // Display memory in result section
    function displayMemory(memory) {
        currentMemory = memory;
        
        // Update UI elements
        const memoryTitle = document.getElementById('memoryTitle');
        const memoryDate = document.getElementById('memoryDate');
        const memoryDescription = document.getElementById('memoryDescription');
        const backgroundImage = document.getElementById('backgroundImage');
        const tapeNumber = document.getElementById('tapeNumber');
        
        if (memoryTitle) memoryTitle.textContent = memory.title;
        if (memoryDate) memoryDate.textContent = memory.date;
        if (memoryDescription) memoryDescription.textContent = memory.description;
        if (backgroundImage) {
            backgroundImage.src = memory.imageSrc;
            backgroundImage.alt = memory.title;
        }
        if (tapeNumber) tapeNumber.textContent = memory.tapeNumber;
        
        // Set audio source
        if (audioPlayer) {
            audioPlayer.src = memory.audioSrc;
            audioPlayer.load();
        }
        
        // Reset playback state
        isPlaying = false;
        updatePlayPauseButton();
        if (progressBar) progressBar.style.width = '0%';
    }
    
    // Toggle play/pause
    function togglePlayPause() {
        if (!audioPlayer) return;
        
        if (audioContext?.state === 'suspended') {
            audioContext.resume();
        }
        
        if (isPlaying) {
            audioPlayer.pause();
            stopAudioVisualization();
        } else {
            audioPlayer.play().catch(error => {
                console.error('Error playing audio:', error);
                showNotification('Could not play audio');
            });
            startAudioVisualization();
        }
        
        isPlaying = !isPlaying;
        updatePlayPauseButton();
    }
    
    // Update play/pause button appearance
    function updatePlayPauseButton() {
        if (!playPauseBtn) return;
        
        const playIcon = playPauseBtn.querySelector('.play-icon');
        const pauseIcon = playPauseBtn.querySelector('.pause-icon');
        
        if (playIcon && pauseIcon) {
            playIcon.style.display = isPlaying ? 'none' : 'inline';
            pauseIcon.style.display = isPlaying ? 'inline' : 'none';
        }
    }
    
    // Update progress bar
    function updateProgressBar() {
        if (!audioPlayer || !progressBar) return;
        
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressBar.style.width = progress + '%';
    }
    
    // Seek audio position
    function seekAudio(e) {
        if (!audioPlayer) return;
        
        const progressContainer = e.currentTarget;
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        
        audioPlayer.currentTime = pos * audioPlayer.duration;
        updateProgressBar();
    }
    
    // Save memory to gallery
    function saveMemory() {
        if (!currentMemory) {
            showNotification('No memory to save');
            return;
        }
        
        // Check if already saved
        if (savedMemories.some(memory => memory.id === currentMemory.id)) {
            showNotification('This memory is already saved');
            return;
        }
        
        // Add to saved memories
        savedMemories.push(currentMemory);
        localStorage.setItem('neuralNostalgiaMemories', JSON.stringify(savedMemories));
        
        showNotification('Memory saved to gallery');
    }
    
    // Share memory
    function shareMemory() {
        if (!currentMemory) {
            showNotification('No memory to share');
            return;
        }
        
        const shareText = `Check out my nostalgic memory: "${currentMemory.title}" created with Neural Nostalgia Player`;
        
        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: 'Neural Nostalgia Memory',
                text: shareText,
                url: window.location.href
            })
            .then(() => showNotification('Shared successfully'))
            .catch(error => {
                console.error('Error sharing:', error);
                fallbackShare(shareText);
            });
        } else {
            fallbackShare(shareText);
        }
    }
    
    // Fallback sharing method (copy to clipboard)
    function fallbackShare(shareText) {
        navigator.clipboard.writeText(shareText)
            .then(() => showNotification('Share text copied to clipboard'))
            .catch(() => showNotification('Could not copy to clipboard'));
    }
    
    // Load memories gallery
    function loadMemoriesGallery() {
        const memoriesList = document.getElementById('memoriesList');
        if (!memoriesList) return;
        
        memoriesList.innerHTML = '';
        
        if (savedMemories.length === 0) {
            memoriesList.innerHTML = '<p class="empty-gallery">No saved memories yet. Generate and save memories to see them here.</p>';
            return;
        }
        
        // Create memory cards
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
            
            memoryCard.addEventListener('click', () => {
                displayMemory(memory);
                showSection(generatedResultSection);
            });
            
            memoriesList.appendChild(memoryCard);
        });
    }
    
    // Clear all saved memories
    function clearMemories() {
        if (!confirm('Are you sure you want to clear all saved memories? This cannot be undone.')) {
            return;
        }
        
        savedMemories = [];
        localStorage.removeItem('neuralNostalgiaMemories');
        loadMemoriesGallery();
        
        showNotification('All memories cleared');
    }
    
    // Show a section and hide others
    function showSection(sectionToShow) {
        if (!sectionToShow) return;
        
        // Pause audio if playing when switching sections
        if (isPlaying && audioPlayer) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseButton();
            stopAudioVisualization();
        }
        
        // If showing gallery, load memories
        if (sectionToShow === memoriesGallerySection) {
            loadMemoriesGallery();
        }
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        sectionToShow.classList.add('active');
    }
    
    // Show notification
    function showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show with animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
});
