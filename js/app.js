/**
 * Weather App - Main Application Module
 * Handles UI interactions, data management, and orchestration
 */

class WeatherApp {
  constructor() {
    this.currentWeather = null;
    this.forecast = null;
    this.isLoading = false;
    this.cache = {};
    this.init();
  }

  /**
   * Initialize the app
   */
  init() {
    this.cacheDOM();
    this.setupEventListeners();
    this.setupGeolocationListener();
    Theme.initialize();
    this.loadRecentSearches();
    this.loadCachedWeather();
    this.checkApiKey();
  }

  /**
   * Cache DOM elements
   */
  cacheDOM() {
    this.elements = {
      // Search
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      suggestionsContainer: document.getElementById('suggestions'),
      recentSearchesContainer: document.getElementById('recentSearches'),

      // Current Weather
      weatherCard: document.getElementById('weatherCard'),
      cityName: document.getElementById('cityName'),
      temperature: document.getElementById('temperature'),
      weatherDescription: document.getElementById('weatherDescription'),
      weatherIcon: document.getElementById('weatherIcon'),
      feelsLike: document.getElementById('feelsLike'),
      humidity: document.getElementById('humidity'),
      pressure: document.getElementById('pressure'),
      windSpeed: document.getElementById('windSpeed'),
      windDirection: document.getElementById('windDirection'),
      visibility: document.getElementById('visibility'),
      sunrise: document.getElementById('sunrise'),
      sunset: document.getElementById('sunset'),

      // Forecast
      forecastContainer: document.getElementById('forecastContainer'),

      // Loading & Error
      loadingSpinner: document.getElementById('loadingSpinner'),
      errorMessage: document.getElementById('errorMessage'),

      // Buttons
      themeToggle: document.getElementById('themeToggle'),
      geolocationBtn: document.getElementById('geolocationBtn'),
      refreshBtn: document.getElementById('refreshBtn'),
      apiKeyBtn: document.getElementById('apiKeyBtn'),
      apiKeyInput: document.getElementById('apiKeyInput'),
      saveApiKeyBtn: document.getElementById('saveApiKeyBtn'),
      apiKeyModal: document.getElementById('apiKeyModal'),
      closeApiKeyBtn: document.getElementById('closeApiKeyBtn'),
    };
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Search
    this.elements.searchBtn.addEventListener('click', () => this.handleSearch());
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSearch();
    });
    this.elements.searchInput.addEventListener('input', () => this.handleSearchInput());

    // Buttons
    this.elements.geolocationBtn.addEventListener('click', () => this.handleGeolocation());
    this.elements.refreshBtn.addEventListener('click', () => this.refreshWeather());
    this.elements.apiKeyBtn.addEventListener('click', () => this.openApiKeyModal());
    this.elements.saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
    this.elements.closeApiKeyBtn.addEventListener('click', () => this.closeApiKeyModal());

    // API Key Modal
    this.elements.apiKeyModal.addEventListener('click', (e) => {
      if (e.target === this.elements.apiKeyModal) {
        this.closeApiKeyModal();
      }
    });

    // Recent Searches
    this.elements.recentSearchesContainer.addEventListener('click', (e) => {
      const searchBtn = e.target.closest('[data-city]');
      if (searchBtn) {
        this.handleSearch(searchBtn.dataset.city);
      }
    });
  }

  /**
   * Setup geolocation listener
   */
  setupGeolocationListener() {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (position) => {
          localStorage.setItem(CONFIG.STORAGE_KEYS.userLocation, JSON.stringify({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          }));
        },
        (error) => {
          console.warn('Geolocation error:', error);
        }
      );
    }
  }

  /**
   * Check if API key is configured
   */
  checkApiKey() {
    const apiKey = CONFIG.API_KEY || localStorage.getItem('weatherAppApiKey') || '';
    if (!apiKey || apiKey.trim() === '') {
      this.showError('API key not configured. Please set your OpenWeatherMap API key.');
      this.openApiKeyModal();
      return false;
    }
    return true;
  }

  /**
   * Handle search input with suggestions
   */
  handleSearchInput() {
    const query = this.elements.searchInput.value.trim();
    if (query.length < 2) {
      this.elements.suggestionsContainer.innerHTML = '';
      return;
    }

    // Show recent searches as suggestions
    this.showSearchSuggestions(query);
  }

  /**
   * Show search suggestions
   * @param {string} query - Search query
   */
  showSearchSuggestions(query) {
    const recentSearches = this.getRecentSearches();
    const suggestions = recentSearches.filter(search =>
      search.toLowerCase().includes(query.toLowerCase())
    );

    if (suggestions.length === 0) {
      this.elements.suggestionsContainer.innerHTML = '';
      return;
    }

    this.elements.suggestionsContainer.innerHTML = suggestions
      .map(suggestion => `
        <div class="suggestion-item" data-city="${suggestion}">
          <span class="suggestion-icon">📍</span>
          <span>${suggestion}</span>
        </div>
      `)
      .join('');

    // Add click listeners to suggestions
    document.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        this.handleSearch(item.dataset.city);
      });
    });
  }

  /**
   * Handle search
   * @param {string} city - City name (optional)
   */
  async handleSearch(city) {
    const searchQuery = city || this.elements.searchInput.value.trim();

    if (!searchQuery) {
      this.showError('Please enter a city name');
      return;
    }

    this.elements.searchInput.value = '';
    this.elements.suggestionsContainer.innerHTML = '';
    await this.fetchWeather(searchQuery);
    this.addRecentSearch(searchQuery);
  }

  /**
   * Handle geolocation
   */
  async handleGeolocation() {
    if (!navigator.geolocation) {
      this.showError(CONFIG.ERROR_MESSAGES.geolocationError);
      return;
    }

    this.showLoading();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await this.fetchWeatherByCoordinates(latitude, longitude);
        } catch (error) {
          this.showError(error.message);
        } finally {
          this.hideLoading();
        }
      },
      (error) => {
        this.hideLoading();
        let errorMsg = CONFIG.ERROR_MESSAGES.geolocationError;
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = CONFIG.ERROR_MESSAGES.permissionDenied;
        }
        this.showError(errorMsg);
      }
    );
  }

  /**
   * Fetch weather data by city name
   * @param {string} city - City name
   */
  async fetchWeather(city) {
    try {
      this.showLoading();
      this.hideError();

      // Check cache first
      if (this.isCached(city)) {
        const cached = this.getFromCache(city);
        this.currentWeather = cached.weather;
        this.forecast = cached.forecast;
        this.updateUI();
        this.hideLoading();
        return;
      }

      // Fetch current weather and forecast in parallel
      const [weather, forecast] = await Promise.all([
        WeatherAPI.getCurrentWeatherByCity(city),
        ForecastAPI.getForecastByCity(city),
      ]);

      this.currentWeather = weather;
      this.forecast = forecast;

      // Cache the data
      this.addToCache(city, weather, forecast);

      // Save to localStorage
      this.saveWeatherToStorage(weather, forecast);

      this.updateUI();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Fetch weather by coordinates
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   */
  async fetchWeatherByCoordinates(lat, lon) {
    try {
      this.showLoading();
      this.hideError();

      const [weather, forecast] = await Promise.all([
        WeatherAPI.getCurrentWeatherByCoordinates(lat, lon),
        ForecastAPI.getForecastByCoordinates(lat, lon),
      ]);

      this.currentWeather = weather;
      this.forecast = forecast;

      this.updateUI();
      this.saveWeatherToStorage(weather, forecast);
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Refresh current weather
   */
  async refreshWeather() {
    if (!this.currentWeather) {
      this.showError('No weather data to refresh. Please search for a city first.');
      return;
    }

    try {
      this.showLoading();
      this.hideError();

      const { lat, lon } = this.currentWeather.coordinates;
      const [weather, forecast] = await Promise.all([
        WeatherAPI.getCurrentWeatherByCoordinates(lat, lon),
        ForecastAPI.getForecastByCoordinates(lat, lon),
      ]);

      this.currentWeather = weather;
      this.forecast = forecast;

      this.updateUI();
      this.saveWeatherToStorage(weather, forecast);
      this.showSuccessMessage('Weather updated');
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Update UI with current weather data
   */
  updateUI() {
    if (!this.currentWeather) return;

    const weather = this.currentWeather;

    // Update current weather card
    this.elements.cityName.textContent = `${weather.city}, ${weather.country}`;
    this.elements.temperature.textContent = `${weather.temperature}°`;
    this.elements.weatherDescription.textContent = this.capitalizeFirst(weather.description);
    this.elements.weatherIcon.src = WeatherAPI.getIconUrl(weather.icon);
    this.elements.weatherIcon.alt = weather.description;

    // Update weather details
    this.elements.feelsLike.textContent = `${weather.feelsLike}°`;
    this.elements.humidity.textContent = `${weather.humidity}%`;
    this.elements.pressure.textContent = `${weather.pressure} mb`;
    this.elements.windSpeed.textContent = `${weather.windSpeed} km/h`;
    this.elements.windDirection.textContent = WeatherAPI.getWindDirection(weather.windDegree);
    this.elements.visibility.textContent = `${weather.visibility} km`;
    this.elements.sunrise.textContent = WeatherAPI.formatTime(weather.sunrise);
    this.elements.sunset.textContent = WeatherAPI.formatTime(weather.sunset);

    // Update forecast
    this.updateForecast();

    // Show weather card
    this.elements.weatherCard.classList.add('show');
  }

  /**
   * Update forecast display
   */
  updateForecast() {
    if (!this.forecast || this.forecast.length === 0) {
      this.elements.forecastContainer.innerHTML = '<p>No forecast data available</p>';
      return;
    }

    this.elements.forecastContainer.innerHTML = this.forecast
      .map(day => `
        <div class="forecast-card">
          <div class="forecast-day">${day.day}</div>
          <img src="${WeatherAPI.getIconUrl(day.icon, '2x')}" alt="${day.description}" class="forecast-icon">
          <div class="forecast-temp">
            <span class="temp-max">${day.tempMax}°</span>
            <span class="temp-min">${day.tempMin}°</span>
          </div>
          <div class="forecast-description">${this.capitalizeFirst(day.description)}</div>
          <div class="forecast-details">
            <div class="detail-row">
              <span class="detail-label">💧 Humidity</span>
              <span class="detail-value">${day.humidity}%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">💨 Wind</span>
              <span class="detail-value">${day.windSpeed} km/h</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">🌧️ Precipitation</span>
              <span class="detail-value">${day.precipitation.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      `)
      .join('');
  }

  /**
   * Manage recent searches
   */
  loadRecentSearches() {
    const searches = this.getRecentSearches();
    this.renderRecentSearches(searches);
  }

  /**
   * Get recent searches from localStorage
   * @returns {Array} Recent searches
   */
  getRecentSearches() {
    const searches = localStorage.getItem(CONFIG.STORAGE_KEYS.recentSearches);
    return searches ? JSON.parse(searches) : [];
  }

  /**
   * Add to recent searches
   * @param {string} city - City name
   */
  addRecentSearch(city) {
    let searches = this.getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== city.toLowerCase());
    searches.unshift(city);
    searches = searches.slice(0, CONFIG.RECENT_SEARCHES_LIMIT);
    localStorage.setItem(CONFIG.STORAGE_KEYS.recentSearches, JSON.stringify(searches));
    this.renderRecentSearches(searches);
  }

  /**
   * Render recent searches
   * @param {Array} searches - Recent searches array
   */
  renderRecentSearches(searches) {
    if (searches.length === 0) {
      this.elements.recentSearchesContainer.innerHTML = '<p class="no-searches">No recent searches</p>';
      return;
    }

    this.elements.recentSearchesContainer.innerHTML = searches
      .map(search => `
        <button class="recent-search-btn" data-city="${search}" type="button">
          <span class="search-icon">📍</span>
          <span>${search}</span>
          <span class="close-icon">×</span>
        </button>
      `)
      .join('');
  }

  /**
   * Cache management
   */
  isCached(city) {
    const cached = this.cache[city.toLowerCase()];
    if (!cached) return false;
    return Date.now() - cached.timestamp < CONFIG.CACHE_DURATION;
  }

  /**
   * Get from cache
   * @param {string} city - City name
   * @returns {Object} Cached data
   */
  getFromCache(city) {
    return this.cache[city.toLowerCase()];
  }

  /**
   * Add to cache
   * @param {string} city - City name
   * @param {Object} weather - Weather data
   * @param {Array} forecast - Forecast data
   */
  addToCache(city, weather, forecast) {
    this.cache[city.toLowerCase()] = {
      weather,
      forecast,
      timestamp: Date.now(),
    };
  }

  /**
   * Save weather to localStorage
   * @param {Object} weather - Weather data
   * @param {Array} forecast - Forecast data
   */
  saveWeatherToStorage(weather, forecast) {
    const data = {
      weather,
      forecast,
      timestamp: Date.now(),
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.lastWeather, JSON.stringify(data));
  }

  /**
   * Load cached weather from localStorage
   */
  loadCachedWeather() {
    const cached = localStorage.getItem(CONFIG.STORAGE_KEYS.lastWeather);
    if (cached) {
      const data = JSON.parse(cached);
      this.currentWeather = data.weather;
      this.forecast = data.forecast;
      this.updateUI();
    }
  }

  /**
   * API Key management
   */
  openApiKeyModal() {
    this.elements.apiKeyInput.value = CONFIG.API_KEY;
    this.elements.apiKeyModal.style.display = 'flex';
    this.elements.apiKeyInput.focus();
  }

  /**
   * Close API key modal
   */
  closeApiKeyModal() {
    this.elements.apiKeyModal.style.display = 'none';
  }

  /**
   * Save API key
   */
  saveApiKey() {
    const apiKey = this.elements.apiKeyInput.value.trim();

    if (!apiKey) {
      this.showError('Please enter a valid API key');
      return;
    }

    if (apiKey.length < 20) {
      this.showError('API key appears to be invalid (too short)');
      return;
    }

    // Save to localStorage and update CONFIG
    localStorage.setItem('weatherAppApiKey', apiKey);
    CONFIG.API_KEY = apiKey;
    setApiKey(apiKey);
    
    this.showSuccessMessage('API key saved successfully! It will be remembered.');
    this.closeApiKeyModal();
    this.cache = {}; // Clear cache when API key changes
    this.hideError(); // Hide any previous error messages
  }

  /**
   * UI Helper methods
   */
  showLoading() {
    this.isLoading = true;
    this.elements.loadingSpinner.style.display = 'block';
  }

  /**
   * Hide loading spinner
   */
  hideLoading() {
    this.isLoading = false;
    this.elements.loadingSpinner.style.display = 'none';
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  showError(message) {
    this.elements.errorMessage.textContent = message;
    this.elements.errorMessage.style.display = 'block';
    setTimeout(() => {
      this.elements.errorMessage.style.display = 'none';
    }, 5000);
  }

  /**
   * Hide error message
   */
  hideError() {
    this.elements.errorMessage.style.display = 'none';
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  showSuccessMessage(message) {
    const tempElement = document.createElement('div');
    tempElement.className = 'success-message';
    tempElement.textContent = message;
    tempElement.style.display = 'block';
    document.body.appendChild(tempElement);

    setTimeout(() => {
      tempElement.remove();
    }, 3000);
  }

  /**
   * Capitalize first letter
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new WeatherApp();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WeatherApp;
}
