/**
 * Weather API Module
 * Handles current weather data fetching and processing
 */

class WeatherAPI {
  /**
   * Fetch current weather by city name
   * @param {string} city - City name
   * @returns {Promise<Object>} Weather data
   */
  static async getCurrentWeatherByCity(city) {
    if (!city || typeof city !== 'string') {
      throw new Error(CONFIG.ERROR_MESSAGES.invalidCity);
    }

    const endpoint = `${CONFIG.API_BASE_URL}/weather`;
    const params = new URLSearchParams({
      q: city.trim(),
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
      lang: CONFIG.LANG,
    });

    return this.fetchWeatherData(`${endpoint}?${params}`);
  }

  /**
   * Fetch current weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data
   */
  static async getCurrentWeatherByCoordinates(lat, lon) {
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      throw new Error('Invalid coordinates provided');
    }

    const endpoint = `${CONFIG.API_BASE_URL}/weather`;
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: CONFIG.API_KEY,
      units: CONFIG.UNITS,
      lang: CONFIG.LANG,
    });

    return this.fetchWeatherData(`${endpoint}?${params}`);
  }

  /**
   * Fetch weather data with error handling
   * @param {string} url - API endpoint URL
   * @returns {Promise<Object>} Weather data
   */
  static async fetchWeatherData(url) {
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
      return this.processWeatherData(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(CONFIG.ERROR_MESSAGES.timeout);
      }
      throw error;
    }
  }

  /**
   * Process and format weather data
   * @param {Object} data - Raw weather data from API
   * @returns {Object} Processed weather data
   */
  static processWeatherData(data) {
    return {
      city: data.name,
      country: data.sys.country,
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      main: data.weather[0].main,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      windDegree: data.wind.deg || 0,
      cloudiness: data.clouds.all,
      visibility: (data.visibility / 1000).toFixed(1),
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      timezone: data.timezone,
      coordinates: {
        lat: data.coord.lat,
        lon: data.coord.lon,
      },
      timestamp: new Date(data.dt * 1000),
    };
  }

  /**
   * Get weather icon URL
   * @param {string} iconCode - Weather icon code from API
   * @param {string} size - Icon size (1x, 2x, 4x)
   * @returns {string} Icon URL
   */
  static getIconUrl(iconCode, size = '4x') {
    return `${CONFIG.ICON_BASE_URL}/${iconCode}@${size}.png`;
  }

  /**
   * Get wind direction from degree
   * @param {number} degree - Wind degree
   * @returns {string} Wind direction
   */
  static getWindDirection(degree) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                       'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degree / 22.5) % 16;
    return directions[index];
  }

  /**
   * Format time to readable format
   * @param {Date} date - Date object
   * @returns {string} Formatted time
   */
  static formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherAPI;
}
