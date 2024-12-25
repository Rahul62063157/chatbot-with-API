const express = require('express');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON and serving static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Verify API key is present
if (!process.env.GEMINI_API_KEY) {
    console.error('ERROR: GEMINI_API_KEY is not set in .env file');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Test route to verify server is running
app.get('/api/test', (req, res) => {
    res.json({ status: 'Server is running' });
});

app.post('/api/chat', async (req, res) => {
    console.log('Received chat request:', req.body);  // Debug log
    
    if (!req.body.message) {
        console.error('No message provided in request');
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const result = await model.generateContent(req.body.message);
        const response = await result.response.text();
        console.log('API Response:', response);  // Debug log
        res.json({ response });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ 
            error: 'An error occurred while processing your request.',
            details: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

