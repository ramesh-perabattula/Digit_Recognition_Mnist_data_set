require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const helmet=require('helmet');
const  rateLimit= require("express-rate-limit");


const app = express();

app.use(helmet());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);


app.use(express.json());


const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/v1/ai-explainer/', async (req, res) => {
  try {
    const { language, code } = req.body;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const result = await model.generateContent(
            `You are an expert programmer and teacher. 
            Explain the following ${language} code step by step in simple, beginner-friendly terms so that even someone new to programming can understand it. 
            Highlight what each part of the code does and why it is important.
            Do not use technical jargon without explanation.
            Code:\n\n${code}`
         );


    const text = result.response.text();
    console.log(text);
    res.json({ explanation: text });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
