import dotenv from 'dotenv';
dotenv.config();

// TODO: Define an interface for the Coordinates object
interface Coordinates {
    lat: number;
    lon: number;

}

// TODO: Define a class for the Weather object
class Weather {
  cityName: string;
  date: string;
  icon: string;
  description: string;
  temp: number;
  windSpeed: number;
  humidity: number;

  constructor(
    cityName: string, 
    date: string, 
    icon: string, 
    description: string, 
    temp: number,
    windSpeed: number,
    humidity: number
   ) {
    this.cityName = cityName;
    this.date = date;
    this.icon = icon;
    this.description = description;
    this.temp = temp;
    this.windSpeed = windSpeed;
    this.humidity = humidity;
  }
}
// TODO: Complete the WeatherService class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';

    this.apiKey = process.env.API_KEY || '';
  } 
  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string): Promise <Coordinates> {
    
      const querystring = this.buildGeocodeQuery(query)
      const response = await fetch(querystring);

      if (!response.ok) throw new Error('Failed to fetch location data');

      const data = await response.json();
      
      if (!data.length) throw new Error('Location not found');

      
      // TODO: Create destructureLocationData method
      const { lat, lon } = data[0];
      console.log({lat, lon})
      return { lat, lon };
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`
    
  }
  // TODO: Create buildWeatherQuery method
  // private buildWeatherQuery(coordinates: Coordinates): string {
    // return `${this.baseURL}/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`;
  // }
  // TODO: Create fetchAndDestructureLocationData method
  // private async fetchAndDestructureLocationData() {
    
  // }
  // TODO: Create fetchWeatherData method
  private async fetchWeatherData({lon, lat}: Coordinates) {
    const response = await fetch(`${this.baseURL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.apiKey}`)
    const weatherData = await response.json()
    console.log(weatherData)
    return weatherData
  }
  // TODO: Build parseCurrentWeather method
  // Utility function to convert Unix time to a human-readable date
  private convertUnixToDate(unixTime: number): string {
  const date = new Date(unixTime * 1000); // Convert seconds to milliseconds
  return date.toLocaleString(); // Convert to a readable format
  }
  // Method to parse the current weather data from the API response
  private parseCurrentWeather(response: any): Weather {
    const city = response.name;
    const date = this.convertUnixToDate(response.dt); // Convert Unix timestamp to readable date
    const icon = response.weather[0].icon;
    const description = response.weather[0].description;
    const temp = response.main.temp;
    const windSpeed = response.wind.speed;
    const humidity = response.main.humidity;

  // Return a new Weather instance with parsed data
  console.log({response})
  return new Weather(city, date, icon, description, temp, windSpeed, humidity);
  }

  // TODO: Complete buildForecastArray method

  // Method to build an array of Weather instances representing the forecast data
  private filterForecastToDaily(forecastData: any[], cityName: string): Weather[] {
    if (!Array.isArray(forecastData)) {
      console.error("Expected forecastData to be an array, but got:", forecastData);
      return []; // Return an empty array if the input is not valid
    }
    const dailyWeatherMap: { [key: string]: Weather } = {};
    const dailyForecastArray: Weather[] = [];
  
    for (const dataPoint of forecastData) {
      const dateString = new Date(dataPoint.dt * 1000).toISOString().split('T')[0];
  
      // Only add the first occurrence of weather data for each day
      if (!dailyWeatherMap[dateString]) {
        const date = this.convertUnixToDate(dataPoint.dt);
        const icon = dataPoint.weather[0].icon;
        const description = dataPoint.weather[0].description;
        const temp = dataPoint.main.temp;
        const windSpeed = dataPoint.wind.speed;
        const humidity = dataPoint.main.humidity;
  
        dailyWeatherMap[dateString] = new Weather(cityName, date, icon, description, temp, windSpeed, humidity);
        dailyForecastArray.push(dailyWeatherMap[dateString]); // Add to the array
  
        // Stop if we have collected 5 days of forecast
        if (dailyForecastArray.length >= 5) {
          return dailyForecastArray; // Exit the forEach loop early
        }
      }
    };
  
    return dailyForecastArray; // Return the final array with up to 5 days
  }
  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string): Promise<Weather[]> {
    try {
      // Step 1: Fetch coordinates for the city
      const coordinates = await this.fetchLocationData(city);
  
      // Step 2: Fetch current weather data using the coordinates
      const currentWeatherResponse = await this.fetchWeatherData(coordinates);
      console.log('Current Weather Response:', currentWeatherResponse); // Log the response
      const currentWeather = this.parseCurrentWeather(currentWeatherResponse);
  
      // Step 3: Fetch forecast data (if needed for additional time points)
      const forecastResponse = await fetch(
        `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${this.apiKey}`
      );
      const forecastData = await forecastResponse.json();
  
      // Step 4: Build forecast array
      const dailyForecastArray = this.filterForecastToDaily(forecastData.list, currentWeather.cityName);
  
      return [currentWeather, ...dailyForecastArray];
    } catch (error) {
      console.log("Error getting weather for city:", error);
      return [];
    }
  }
}

export default new WeatherService();
