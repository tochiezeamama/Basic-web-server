const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config(); 

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    if (!visitorName) {
        return res.json({ message: 'Please input your name.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const geoResponse = await axios.get(`https://ipapi.co/${clientIp}/json/`);
        const city = geoResponse.data.city;
        if (!city) {
            return res.json({ message: 'Could not determine your location. Please try again.' });
        }

        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
        const temperature = weatherResponse.data.current.temp_c;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`
        });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
