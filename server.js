// Import dependencies
require('dotenv').config();
const express = require('express');
const {
  Configuration,
  OpenAIApi
} = require("openai");
const axios = require("axios");

// Set up OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up express server
const app = express();
app.use(express.json({ limit: '5mb' })); // Increase limit to 5mb

app.post('/api', async (req, res) => {
  try {
    const noBangerTweet = req.body.noBangerTweet;
    const systemPrompt = "You turn mediocre tweets into banger tweets. Give your very best for max virality potencial.";
    
    const requestBody = {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: noBangerTweet
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
      stream: true,
    };

    console.log('Sending complete request to OpenAI API:', requestBody); // Log the entire request
    console.log('Tokens used in the request:', requestBody.messages.reduce((acc, message) => acc + message.content.split(' ').length, 0));

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        responseType: 'stream',
      }
    );

    console.log('OpenAI API response status:', openaiResponse.status);

    openaiResponse.data
      .on('data', (chunk) => {
        const message = chunk.toString();
        if (message.trim() !== '') {
          res.write(message);
        }
      })
      .on('end', () => {
        res.end();
      });
  } catch (error) {
    console.error('An error occurred in /api/openai:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Listen on port 3000
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


