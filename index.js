const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();
async function getGeoLocation(ip) {
    try {
        const response = await axios.get(`https://ipapi.co/${ip}/json/`);
        return response.data;
    } catch (error) {
        console.error('Error fetching geolocation data:', error);
        return null;
    }
}
app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name;
    if (!visitorName) {
        return res.json({ message: 'Please input your name.' });
    }
  
    const clientIp = req.headers['x-forwarded-for'] || req.ip;
    console.log({
        h: req.headers,
        ip: req.ip
    });
    try {
        const geoResponse = await getGeoLocation(clientIp);
        const { city, ip } = geoResponse;
        if (!city) {
            console.log(geoResponse);
            return res.json({ message: 'Could not determine your location. Please try again.' });
        }
        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=WEATHER_API_KEY=${city}`);
        const temperature = weatherResponse.data.current.temp_c;
        res.json({
            client_ip: ip,
            location: city,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
});
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
