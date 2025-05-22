# Neural Nostalgia Deployment Checklist

## Backend Server (Render.com)

1. **Check if your Render service is running**
   - Visit https://dashboard.render.com/
   - Check the status of your "neural-nostalgia" service
   - It should show "Live" status

2. **Verify environment variables are set**
   - In your Render dashboard, click on your service
   - Go to the "Environment" tab
   - Verify that you have these variables:
     - `OPENAI_API_KEY` (your OpenAI API key)
     - `REPLICATE_API_KEY` (your Replicate API key)

3. **Check server logs for errors**
   - In your Render dashboard, click on your service
   - Go to the "Logs" tab
   - Look for any error messages

4. **Test the API endpoints directly**
   - Open the api-test.html file locally
   - Or visit https://neural-nostalgia.onrender.com to see if the server responds

## Frontend (Cloudflare Pages)

1. **Verify deployment**
   - Your frontend is already running at https://neural-nostalgia.pages.dev

2. **Check browser console for errors**
   - Open your app in a browser
   - Right-click and select "Inspect" or press F12
   - Go to the "Console" tab
   - Look for error messages (they'll be in red)

## Troubleshooting

If the API isn't working, try these steps:

1. **CORS Issues**
   - If you see CORS errors in the console, make sure your server's CORS configuration includes your frontend domain
   - We've already updated this in the server.js file

2. **API Key Issues**
   - Check if your API keys are valid
   - Test them manually in the OpenAI and Replicate dashboards

3. **Server Errors**
   - Check the server logs for specific error messages
   - Make sure you're not hitting rate limits

4. **Network Issues**
   - Check if your backend URL is correct
   - Make sure there are no firewalls blocking the requests

5. **Test Fallback Mode**
   - If nothing else works, the app should fall back to using placeholder content

## Quick Fix: Try with Local Backend

If you want to test with a local backend:

1. Start the backend server locally:
   ```bash
   cd server
   npm install
   npm start
   ```

2. Change the API endpoints in config.js to use localhost:
   ```javascript
   // API Endpoints
   ENDPOINTS: {
       prompts: 'http://localhost:3000/api/generate-prompts',
       image: 'http://localhost:3000/api/generate-image',
       music: 'http://localhost:3000/api/generate-music',
       // ...
   }
   ```

3. Open the app locally (using a simple HTTP server):
   ```bash
   npx http-server
   ```

4. Visit http://localhost:8080 in your browser
