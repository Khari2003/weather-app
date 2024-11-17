const axios = require('axios');
const CityModel = require('../models/city.models');

const API_KEY = "4e26d9536210174bef92daadc972ad15";

// Function to remove diacritics
function removeDiacritics(str) {
    let noDiacritics = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    noDiacritics = noDiacritics.replace(/Đ/g, 'D').replace(/đ/g, 'd');
    return noDiacritics;
}

// Function to search for related cities based on the entered name
const searchRelatedCities = async (req, res) => {
    let nameCity = req.body.name || req.query.name;

    if (!nameCity) {
        try {
            const ipResponse = await axios.get('http://ip-api.com/json/');
            nameCity = ipResponse.data.city;
        } catch (error) {
            console.error('Error retrieving city from IP:', error);
            return res.status(500).json({ message: 'Error retrieving city from IP' });
        }
    }

    try {
        const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${nameCity}&limit=50&appid=${API_KEY}`);
        const filteredCities = geoResponse.data.filter(city => {
            const cityMatches = city.name.toLowerCase().startsWith(nameCity.toLowerCase());
            const localNameMatches = city.local_names && 
                Object.values(city.local_names).some(localName => localName.toLowerCase().startsWith(nameCity.toLowerCase()));
            return cityMatches || localNameMatches;
        });

        if (filteredCities.length === 0) {
            const output = removeDiacritics(nameCity)
            const geoResponse = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${output}&limit=50&appid=${API_KEY}`);
            const filtered = geoResponse.data.filter(city => {
                const cityMatches = city.name.toLowerCase().startsWith(output.toLowerCase());
                const localNameMatches = city.local_names && 
                    Object.values(city.local_names).some(localName => localName.toLowerCase().startsWith(output.toLowerCase()));
                return cityMatches || localNameMatches;
            }); 
            return res.json(filtered);
        }

        return res.json(filteredCities);
    } catch (error) {
        console.error('Error retrieving city data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to display weather data for a specific city based on lat/lon
const displayWeatherData = async (req, res) => {
    let { lat, lon } = req.body || req.query;  // Changed const to let

    if (!lat && !lon) {
        try {
            const ipResponse = await axios.get('http://ip-api.com/json/');
            lat = ipResponse.data.lat;
            lon = ipResponse.data.lon;
            console.log(lat, lon);
        } catch (error) {
            console.error('Error retrieving city from IP:', error);
            return res.status(500).json({ message: 'Error retrieving city from IP' });
        }
    }

    try {
        const [weatherResponse, aqiResponse] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
            axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        ]);

        const weatherData = {
            current: weatherResponse.data.current,
            daily: weatherResponse.data.daily,
            hourly: weatherResponse.data.hourly,
            lat,
            lon,
            aqi: aqiResponse.data.list[0].main.aqi,
            // alerts: [
            //     {
            //         "sender_name": "Philippine Atmospheric, Geophysical and Astronomical Services Administration",
            //         "event": "Tropical Cyclone Warning",
            //         "start": 1668528000,
            //         "end": 1668614400,
            //         "description": "Heavy rainfall expected over Luzon..."
            //     }
            // ]
        };

        // Kiểm tra và thêm phần tử alerts nếu tồn tại
        if (weatherResponse.data.alerts) {
            weatherData.alerts = weatherResponse.data.alerts;
        }

        res.json(weatherData);
    } catch (error) {
        console.error('Error retrieving weather data:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Updated function to save a city to favorites
const saveFavoriteCity = async (req, res) => {
    const { name, country, lat, lon } = req.body;

    try {
        let city = await CityModel.findOne({ name, country, lat, lon });
        if (city) {
            return res.status(400).json({ message: 'City is already in favorites' });
        }

        city = new CityModel({ name, country, lat, lon });
        await city.save();

        res.status(201).json({ message: 'City saved to favorites', city });
    } catch (error) {
        console.error('Error saving favorite city:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to get all favorite cities
const getFavoriteCities = async (req, res) => {
    try {
        const cities = await CityModel.find();
        res.json(cities);
    } catch (error) {
        console.error('Error retrieving favorite cities:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to delete a favorite city
const deleteFavoriteCity = async (req, res) => {
    const { name, country, lat, lon } = req.body || req.query;

    try {
        const city = await CityModel.findOneAndDelete({ name, country, lat, lon });
        if (!city) {
            return res.status(404).json({ message: 'City not found in favorites' });
        }

        res.status(200).json({ message: 'City removed from favorites' });
    } catch (error) {
        console.error('Error deleting favorite city:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Export the functions
module.exports = {
    searchRelatedCities,
    displayWeatherData,
    saveFavoriteCity,
    getFavoriteCities,
    deleteFavoriteCity
};
