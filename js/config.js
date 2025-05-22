// Neural Nostalgia Player - Configuration
const CONFIG = {
    // API Keys - No longer needed in frontend
    OPENAI_API_KEY: '',
    REPLICATE_API_KEY: '',
    
    // API Endpoints - Point to our backend proxy server
    ENDPOINTS: {
        // Update these URLs with your actual server address when deployed
        prompts: 'https://localhost:3000/api/generate-prompts',
        image: 'https://localhost:3000/api/generate-image',
        music: 'https://localhost:3000/api/generate-music',
        
        // Keep original endpoints for reference
        openai: 'https://api.openai.com/v1/chat/completions',
        dalle: 'https://api.openai.com/v1/images/generations',
        musicgen: 'https://api.replicate.com/v1/predictions'
    },
    
    // Feature Flags
    FEATURES: {
        // These can now default to true since we're using the backend proxy
        useRealPromptGeneration: true,
        useRealImageGeneration: true,
        useRealMusicGeneration: true,
        enhancedVhsEffects: true,
        showAudioVisualizer: true,
        randomGlitches: true
    },
    
    // Audio Visualizer Settings
    VISUALIZER: {
        barCount: 20,
        minHeight: 3,
        maxHeight: 30,
        sensitivity: 1.2
    },
    
    // VHS Effect Settings
    VHS_EFFECTS: {
        trackingIssueFrequency: 8000, // ms between random tracking issues
        randomGlitchFrequency: 10000, // ms between random glitches
        glitchDuration: 500 // ms
    }
};

export default CONFIG;