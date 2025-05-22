import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
// Configure CORS to allow requests from your frontend domain
app.use(cors({
  origin: ['https://neural-nostalgia.pages.dev', 'http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Get API keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;

// Validate that API keys are present
if (!OPENAI_API_KEY || !REPLICATE_API_KEY) {
  console.error("Missing API keys! Make sure OPENAI_API_KEY and REPLICATE_API_KEY are set in .env file.");
}

// Generate prompts endpoint
app.post('/api/generate-prompts', async (req, res) => {
  try {
    const { memoryText } = req.body;
    
    console.log(`Generating prompts for: "${memoryText}"`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a nostalgia expert that creates prompts for image and music generation based on memories. Format your response as JSON with keys: imagePrompt, musicPrompt, and date (a specific nostalgic date that fits the memory)."
          },
          {
            role: "user",
            content: `Create prompts for a nostalgic memory: "${memoryText}"`
          }
        ],
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    console.log('Generated prompts:', result);
    
    res.json(result);
  } catch (error) {
    console.error('Error generating prompts:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log(`Generating image for prompt: "${prompt}"`);
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `A nostalgic scene: ${prompt}. Cinematic, photorealistic, nostalgic lighting, film grain.`,
        n: 1,
        size: "1024x1024"
      })
    });
    
    if (!response.ok) {
      throw new Error(`DALL-E API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Generated image URL:', data.data[0].url);
    
    res.json({ url: data.data[0].url });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate music endpoint
app.post('/api/generate-music', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    console.log(`Generating music for prompt: "${prompt}"`);
    
    // Call Replicate API to start music generation
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${REPLICATE_API_KEY}`
      },
      body: JSON.stringify({
        version: "7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906",
        input: {
          prompt: `Create nostalgic music for: ${prompt}. Retro, ambient, lo-fi.`,
          duration: 30
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Poll for the result
    if (data.urls && data.urls.get) {
      let output = null;
      let attempts = 0;
      const maxAttempts = 30;
      
      // Poll until we get a result or hit the maximum number of attempts
      while (!output && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls
        
        console.log(`Polling for music result, attempt ${attempts + 1}/${maxAttempts}`);
        
        const pollResponse = await fetch(data.urls.get, {
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`
          }
        });
        
        if (!pollResponse.ok) {
          throw new Error(`Error polling for result: ${pollResponse.status}`);
        }
        
        const pollData = await pollResponse.json();
        
        if (pollData.status === 'succeeded' && pollData.output) {
          output = pollData.output;
          console.log('Generated music URL:', output);
          break;
        } else if (pollData.status === 'failed') {
          throw new Error('Music generation failed');
        }
        
        attempts++;
      }
      
      if (output) {
        res.json({ url: output });
      } else {
        throw new Error('Timeout waiting for music generation');
      }
    } else {
      throw new Error('No polling URL found in the response');
    }
  } catch (error) {
    console.error('Error generating music:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the static files from the public directory
app.use(express.static('public'));

// Default route to serve index.html
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
