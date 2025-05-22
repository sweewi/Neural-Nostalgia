// Neural Nostalgia Player - API Service
import CONFIG from './config.js';

class ApiService {    /**
     * Generate prompts for image and music based on user's memory description
     * @param {string} memoryText - The user's memory description
     * @returns {Promise<Object>} - Object containing prompts and date
     */    static async generatePrompts(memoryText) {
        try {
            console.log(`Attempting to generate prompts for: "${memoryText}"`);
            console.log(`Using endpoint: ${CONFIG.ENDPOINTS.prompts}`);
            
            const response = await fetch(CONFIG.ENDPOINTS.prompts, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ memoryText })
            });
            
            console.log('Prompts API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Successful prompts result:', result);
            
            return {
                imagePrompt: result.imagePrompt,
                musicPrompt: result.musicPrompt,
                date: result.date
            };
        } catch (error) {
            console.error('Error generating prompts:', error);
            console.log('Falling back to local prompt generation');
            return this.generateFallbackPrompts(memoryText);
        }
    }
      /**
     * Generate an image based on a prompt
     * @param {string} prompt - The image generation prompt
     * @returns {Promise<string>} - URL of the generated image
     */    static async generateImage(prompt) {
        try {
            console.log(`Attempting to generate image for prompt: "${prompt}"`);
            console.log(`Using endpoint: ${CONFIG.ENDPOINTS.image}`);
            
            const response = await fetch(CONFIG.ENDPOINTS.image, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            
            console.log('Image API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Successful image result:', data);
            
            return data.url;
        } catch (error) {
            console.error('Error generating image:', error);
            console.log('Falling back to placeholder image');
            return this.getRandomPlaceholderImage();
        }
    }/**
     * Generate music based on a prompt using MusicGen API
     * @param {string} prompt - The music generation prompt
     * @returns {Promise<string>} - URL of the generated music
     */    static async generateMusic(prompt) {
        try {
            console.log(`Attempting to generate music for prompt: "${prompt}"`);
            console.log(`Using endpoint: ${CONFIG.ENDPOINTS.music}`);
            
            const response = await fetch(CONFIG.ENDPOINTS.music, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            
            console.log('Music API response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Successful music result:', data);
            
            return data.url;
        } catch (error) {
            console.error('Error generating music:', error);
            console.log('Falling back to lofi track');
            return this.getRandomLofiTrack();
        }
    }
    
    /**
     * Generate fallback prompts when API is not available
     * @param {string} memoryText - The user's memory description
     * @returns {Object} - Object containing prompts and date
     */
    static generateFallbackPrompts(memoryText) {
        // Extract potential decade or time period from the memory text
        let date = '';
        const decades = ['70s', '80s', '90s', '2000s', '1970', '1980', '1990', '2000'];
        
        for (const decade of decades) {
            if (memoryText.includes(decade)) {
                date = `${decade}`;
                break;
            }
        }
        
        // If no decade found, generate a random one
        if (!date) {
            const randomDecades = ['Summer 1985', 'Fall 1992', 'Spring 1988', 'Winter 1997', 'Summer 2002'];
            date = randomDecades[Math.floor(Math.random() * randomDecades.length)];
        }
        
        return {
            imagePrompt: `Nostalgic scene: ${memoryText}`,
            musicPrompt: `Nostalgic music for: ${memoryText}`,
            date: date
        };
    }
    
    /**
     * Get a random placeholder image URL
     * @returns {string} - URL of a random nostalgic image
     */
    static getRandomPlaceholderImage() {
        const images = [
            'https://images.unsplash.com/photo-1556139943-4bdca53adf1e?q=80&w=1000',
            'https://images.unsplash.com/photo-1610448721566-47369c768e70?q=80&w=1000',
            'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=1000',
            'https://images.unsplash.com/photo-1596627116790-af6f96d9ec1b?q=80&w=1000',
            'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=1000',
            'https://images.unsplash.com/photo-1533677465976-5b803f9db599?q=80&w=1000',
            'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=1000',
            'https://images.unsplash.com/photo-1611464908623-07f19927264e?q=80&w=1000'
        ];
        
        return images[Math.floor(Math.random() * images.length)];
    }
    
    /**
     * Get a random lofi track URL
     * @returns {string} - URL of a random lofi track
     */
    static getRandomLofiTrack() {
        const tracks = [
            'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c9d257f491.mp3?filename=lofi-study-112191.mp3',
            'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d16737dc28.mp3?filename=lofi-chill-14093.mp3',
            'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-hip-hop-11489.mp3',
            'https://cdn.pixabay.com/download/audio/2022/10/25/audio_4bcf37c34a.mp3?filename=lofi-rain-110450.mp3',
            'https://cdn.pixabay.com/download/audio/2022/10/09/audio_cb15ae478b.mp3?filename=over-the-garden-wall-110425.mp3',
            'https://cdn.pixabay.com/download/audio/2023/06/29/audio_b84404712b.mp3?filename=calm-and-peaceful-127571.mp3'
        ];
        
        return tracks[Math.floor(Math.random() * tracks.length)];
    }
}

export default ApiService;