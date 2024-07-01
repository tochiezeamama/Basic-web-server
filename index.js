const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config(); 

async function getPublicIp() {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.error('Error fetching public IP:', error);
      return null;
    }
  }

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

    try {
        const publicIp = await getPublicIp();
        const geoResponse = await getGeoLocation(publicIp);

        const { city, ip } = geoResponse;
        if (!city) {
            return res.json({ message: 'Could not determine your location. Please try again.' });
        }

        const weatherResponse = await axios.get(`http://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${city}`);
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
