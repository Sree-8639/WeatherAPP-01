/**
 * Forecast API Module
 * Handles 5-day weather forecast data fetching and processing
 */

class ForecastAPI {
  /**
   * Fetch 5-day forecast by city name
   * @param {string} city - City name
   * @returns {Promise<Array>} Forecast data
   */
  static async getForecastByCity(city) {
    if (!city || typeof city !== 'string') {
      throw new Error(CONFIG.ERROR_MESSAGES.invalidCity);
    }

    const endpoint = `${CONFIG.API_BASE_URL}/forecast`;
    const params = new URLSearchParams({
      q: city.trim(),
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
      lang: CONFIG.LANG,
      cnt: '40', // 5 days * 8 (3-hour intervals)
    });

    return this.fetchForecastData(`${endpoint}?${params}`);
  }

  /**
   * Fetch 5-day forecast by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Array>} Forecast data
   */
  static async getForecastByCoordinates(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('Invalid coordinates provided');
    }

    const endpoint = `${CONFIG.API_BASE_URL}/forecast`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
      lang: CONFIG.LANG,
      cnt: '40', // 5 days * 8 (3-hour intervals)
    });

    return this.fetchForecastData(`${endpoint}?${params}`);
  }

  /**
   * Fetch forecast data with error handling
   * @param {string} url - API endpoint URL
   * @returns {Promise<Array>} Processed forecast data
   */
  static async fetchForecastData(url) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(CONFIG.ERROR_MESSAGES.invalidApiKey);
        }
        if (response.status === 404) {
          throw new Error(CONFIG.ERROR_MESSAGES.invalidCity);
        }
        throw new Error(CONFIG.ERROR_MESSAGES.apiError);
      }

      const data = await response.json();
      return this.processForecastData(data.list);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(CONFIG.ERROR_MESSAGES.timeout);
      }
      throw error;
    }
  }

  /**
   * Process and aggregate forecast data by day
   * @param {Array} forecastList - Raw forecast list from API
   * @returns {Array} Processed daily forecast data
   */
  static processForecastData(forecastList) {
    const dailyForecasts = {};

    // Group forecasts by day
    forecastList.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dateKey = date.toDateString();

      if (!dailyForecasts[dateKey]) {
        dailyForecasts[dateKey] = {
          day,
          date,
          temps: [],
          description: forecast.weather[0].description,
          main: forecast.weather[0].main,
          icon: forecast.weather[0].icon,
          humidity: forecast.main.humidity,
          windSpeed: Math.round(forecast.wind.speed * 3.6),
          precipitation: forecast.rain ? forecast.rain['3h'] : 0,
          cloudiness: forecast.clouds.all,
        };
      }

      dailyForecasts[dateKey].temps.push(forecast.main.temp);
    });

    // Calculate min/max for each day and convert to array
    return Object.keys(dailyForecasts)
      .slice(0, CONFIG.FORECAST_DAYS)
      .map((key) => {
        const forecast = dailyForecasts[key];
        return {
          day: forecast.day,
          date: forecast.date,
          tempMax: Math.round(Math.max(...forecast.temps)),
          tempMin: Math.round(Math.min(...forecast.temps)),
          description: forecast.description,
          main: forecast.main,
          icon: forecast.icon,
          humidity: forecast.humidity,
          windSpeed: forecast.windSpeed,
          precipitation: forecast.precipitation,
          cloudiness: forecast.cloudiness,
        };
      });
  }

  /**
   * Get forecast card data
   * @param {Object} forecast - Daily forecast object
   * @returns {Object} Formatted forecast card data
   */
  static getCardData(forecast) {
    return {
      day: forecast.day,
      tempRange: `${forecast.tempMax}° / ${forecast.tempMin}°`,
      description: forecast.description,
      icon: WeatherAPI.getIconUrl(forecast.icon, '2x'),
      humidity: `${forecast.humidity}%`,
      windSpeed: `${forecast.windSpeed} km/h`,
      precipitation: `${forecast.precipitation.toFixed(1)} mm`,
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ForecastAPI;
}
