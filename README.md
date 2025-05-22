# Neural Nostalgia Player

Neural Nostalgia Player creates immersive nostalgic experiences based on your memories, leveraging AI to generate visuals and soundscapes that bring your memories to life.

## Features

- Convert text memories into nostalgic visual and audio experiences
- AI-generated images based on your memories
- AI-generated soundscapes that match the mood of your memories
- Retro VHS effects and audio visualizer
- Save and share your nostalgic memories

## Project Structure

The project consists of two main parts:

1. **Frontend**: A static web application
2. **Backend**: A Node.js server that acts as a proxy for API calls

## Deployment Guide

### Backend Deployment

1. **Set up Environment Variables**

   Before deploying, make sure to set up your environment variables in your hosting platform:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `REPLICATE_API_KEY` - Your Replicate API key
   - `PORT` - The port for your server (usually set by the hosting platform)

2. **Deploy to a Hosting Platform**

   The backend can be deployed to various platforms:
   
   **Render.com**:
   - Create a new Web Service
   - Connect to your GitHub repository
   - Set the Build Command: `npm install`
   - Set the Start Command: `node server.js`
   - Add environment variables
   
   **Vercel**:
   - Install Vercel CLI: `npm i -g vercel`
   - Navigate to the server directory: `cd server`
   - Deploy: `vercel`
   
   **Railway**:
   - Connect to your GitHub repository
   - Add environment variables
   - Railway will automatically detect Node.js and deploy your app

3. **Update Frontend Configuration**

   After deploying the backend, update the `config.js` file in your frontend with the correct backend URL:
   
   ```javascript
   // Example
   ENDPOINTS: {
       prompts: 'https://your-deployed-backend-url.com/api/generate-prompts',
       image: 'https://your-deployed-backend-url.com/api/generate-image',
       music: 'https://your-deployed-backend-url.com/api/generate-music'
   }
   ```

### Frontend Deployment

1. **Deploy to Cloudflare Pages**:
   - Sign in to your Cloudflare account
   - Go to "Pages" and click "Create a project"
   - Connect to your GitHub repository
   - Set the build settings:
     - Build command: (leave empty for static site)
     - Build output directory: ./
   - Click "Save and Deploy"

2. **Other Options**:
   - GitHub Pages
   - Netlify
   - Vercel

## Local Development

### Running the Backend

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your API keys:
   ```
   OPENAI_API_KEY=your-openai-key
   REPLICATE_API_KEY=your-replicate-key
   PORT=3000
   ```

4. Start the server:
   ```
   npm start
   ```

### Running the Frontend

Since the frontend is static HTML/CSS/JS, you can simply open the `index.html` file in your browser, or use a local development server:

1. Install a simple HTTP server:
   ```
   npm install -g http-server
   ```

2. Start the server:
   ```
   http-server
   ```

3. Open http://localhost:8080 in your browser

## Important Notes

- The backend server handles all API calls, so users don't need to provide their own API keys
- API usage costs are billed to the API keys you provide in the backend
- Consider implementing rate limiting to control costs
