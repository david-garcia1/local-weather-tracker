import { Router } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';
import WeatherService from '../../service/weatherService.js';

// TODO: POST Request with city name to retrieve weather data
router.post('/', async (req, res) => {
  try {
    console.log(req.body)
    const { cityName } = req.body; // Get city name from request body
    if (!cityName) return res.status(400).json({ error: "City name is required" });

    // Retrieve weather data using WeatherService
    const weatherData = await WeatherService.getWeatherForCity(cityName);
    if (weatherData.length === 0) {
      return res.status(404).json({ error: "Weather data not found" });
    }

    // Save city to search history using HistoryService
    await HistoryService.addCity(cityName);

    // Send weather data in response
    return res.json(weatherData);
  } catch (err) {
    console.error("Error retrieving weather data:", err);
   return res.status(500).json({ error: "Failed to retrieve weather data" });
  }
});

// TODO: GET search history
router.get('/history', async (_req, res) => {
  try {
    // Retrieve search history from HistoryService
    const history = await HistoryService.getCities();
    return res.json(history);
  } catch (err) {
    console.error("Error retrieving search history:", err);
    return res.status(500).json({ error: "Failed to retrieve search history" });
  }
});

// * BONUS TODO: DELETE city from search history
router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get the city ID from request params

    // Delete city from history using HistoryService
    const success = await HistoryService.removeCity(id);
    if (!success) {
      return res.status(404).json({ error: "City not found in history" });
    }

    return res.status(200).json({ message: "City deleted from history" });
  } catch (err) {
    console.error("Error deleting city from search history:", err);
    return res.status(500).json({ error: "Failed to delete city from history" });
  }
});

export default router;
