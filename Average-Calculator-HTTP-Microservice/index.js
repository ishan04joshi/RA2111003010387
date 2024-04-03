
const express = require('express');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const windowSize = parseInt(process.env.WINDOW_SIZE, 10);
const apiUrl = process.env.API_URL;
const windowPrevState = [];
const windowCurrState = [];

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  req.headers.authorization = 'Bearer test-token';
  next();
});

async function fetchNumbers(type) {
  try {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(`https://${apiUrl}/numbers/${type}`, { httpsAgent });
    const numbers = response.data.numbers;

    if (numbers.length > 0 && numbers.every(num => Number.isInteger(num))) {
      return numbers;
    } else {
      console.warn(`Invalid response from the third-party server for type ${type}:`, response.data);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching numbers for type ${type}:`, error.message);
    return [];
  }
}

function isUnique(number) {
    return !windowState.includes(number);
}

function updateWindowState(number) {
    windowState.push(number);
    if (windowState.length > windowSize) {
        windowState.shift();
    }
}

function calculateAverage(state) {
    const sum = state.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / state.length).toFixed(2));
}

app.get('/numbers/:type', async (req, res) => {
    const type = req.params.type;
    const numbers = await fetchNumbers(type);

    if (numbers.length > 0) {
        const uniqueNumbers = numbers.filter(num => isUnique(num));
        uniqueNumbers.forEach(num => updateWindowState(num));

        const average = calculateAverage(windowState);

        res.json({
            windowState: windowState,
            numbers: numbers,
            avg: average
        });
    } else {
        res.status(400).json({
            error: 'No valid numbers received from third-party server'
        });
    }
});

const port = process.env.PORT || 9876; 
app.use((req, res, next) => {
    req.headers.authorization = 'Bearer test-token';
    next();
  });
  

app.listen(9876, () => {
    console.log('Average calculator microservice listening on port 9876');
    app.use((req, res, next) => {
      res.setHeader('Connection', 'close');
      next();
    });
  });