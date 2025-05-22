// Neural Nostalgia Player - Quick Fix Version

// Wait for DOM to be loaded
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
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
    const newMemoryBtn = document.getElementById('newMemoryBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const aboutModal = document.getElementById('aboutModal');
    const settingsModal = document.getElementById('settingsModal');
    const modalCloseBtns = document.querySelectorAll('.close-btn');
    
    // State variables
    let currentMemory = null;
    let isPlaying = false;
    let savedMemories = JSON.parse(localStorage.getItem('neuralNostalgiaMemories')) || [];
    
    // Show input section by default
    showSection(memoryInputSection);
    
    // Set current year in footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    
    // Setup event listeners
    
    // Generate Memory button
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            generateMemory();
        });
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
        playPauseBtn.addEventListener('click', function() {
            togglePlayPause();
        });
    }
    
    // Audio player events
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', function() {
            updateProgressBar();
        });
        
        audioPlayer.addEventListener('ended', function() {
            isPlaying = false;
            updatePlayPauseButton();
        });
    }
    
    // Memory actions
    if (saveMemoryBtn) {
        saveMemoryBtn.addEventListener('click', function() {
            saveMemory();
        });
    }
    
    if (newMemoryBtn) {
        newMemoryBtn.addEventListener('click', function() {
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
    
    // Generate memory
    function generateMemory() {
        const memoryText = memoryTextarea.value.trim();
        
        if (!memoryText) {
            showNotification('Please enter a memory description');
            return;
        }
        
        // Show loading screen
        showSection(loadingScreen);
        
        // Update loading message
        if (loadingMessage) {
            loadingMessage.textContent = 'Generating nostalgic experience...';
        }
        
        // Simulate API call with setTimeout
        setTimeout(function() {
            // Create a mock memory
            const memory = createMockMemory(memoryText);
            
            // Display the memory
            displayMemory(memory);
            
            // Show the result section
            showSection(generatedResultSection);
        }, 3000);
    }
    
    // Create a mock memory
    function createMockMemory(memoryText) {
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
        
        // Generate random tape number
        const tapeNumber = Math.floor(Math.random() * 900 + 100).toString();
        
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
            tapeNumber: tapeNumber
        };
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
        if (backgroundImage) backgroundImage.src = memory.imageSrc;
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
        
        if (isPlaying) {
            audioPlayer.pause();
        } else {
            audioPlayer.play();
        }
        
        isPlaying = !isPlaying;
        updatePlayPauseButton();
    }
    
    // Update play/pause button
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
    
    // Save memory to gallery
    function saveMemory() {
        if (!currentMemory) {
            showNotification('No memory to save');
            return;
        }
        
        // Check if memory already exists
        if (savedMemories.some(memory => memory.id === currentMemory.id)) {
            showNotification('This memory is already saved');
            return;
        }
        
        // Add to saved memories
        savedMemories.push(currentMemory);
        
        // Save to localStorage
        localStorage.setItem('neuralNostalgiaMemories', JSON.stringify(savedMemories));
        
        // Show notification
        showNotification('Memory saved to gallery');
    }
    
    // Show notification
    function showNotification(message, duration = 3000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Show notification with animation
        setTimeout(function() {
            notification.classList.add('show');
        }, 10);
        
        // Remove after duration
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                document.body.removeChild(notification);
            }, 300);
        }, duration);
    }
    
    // Show a section and hide others
    function showSection(sectionToShow) {
        if (!sectionToShow) return;
        
        // Hide all sections
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show requested section
        sectionToShow.classList.add('active');
    }
});
