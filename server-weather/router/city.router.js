const express = require('express');
const {
    searchRelatedCities,
    displayWeatherData,
    saveFavoriteCity,
    getFavoriteCities,
    deleteFavoriteCity
} = require('../controller/searchCity.controller');

const router = express.Router();

// Route to search for cities related to the entered name
router.get('/search', searchRelatedCities);

// Route to get weather data for a specific city based on lat and lon
router.post('/weather', displayWeatherData);

// Route to save a city to the favorites list
router.post('/save', saveFavoriteCity);

// Route to get the list of saved favorite cities
router.get('/favorites', getFavoriteCities);

// Route to delete a city from the favorites list
router.delete('/favorites/delete', deleteFavoriteCity);

module.exports = router;
