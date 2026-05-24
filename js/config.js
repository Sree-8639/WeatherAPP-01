/**
 * Weather App Configuration
 * Contains API keys, endpoints, and constants
 */

// Initialize API Key from localStorage
const getInitialApiKey = () => {
  return localStorage.getItem('weatherAppApiKey') || '';
};

const CONFIG = {
  // OpenWeatherMap API
  API_KEY: getInitialApiKey(),
  API_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  GEO_API_URL: 'https://api.openweathermap.org/geo/1.0',
  ICON_BASE_URL: 'https://openweathermap.org/img/wn',

  // App Constants
  UNITS: 'metric',
  LANG: 'en',
  FORECAST_DAYS: 5,
  RECENT_SEARCHES_LIMIT: 8,
  CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  REQUEST_TIMEOUT: 10000, // 10 seconds

  // Storage Keys
  STORAGE_KEYS: {
    theme: 'weatherApp_theme',
    recentSearches: 'weatherApp_recentSearches',
    lastWeather: 'weatherApp_lastWeather',
    apiKey: 'weatherAppApiKey',
    userLocation: 'weatherApp_userLocation',
  },

  // Theme Colors
  COLORS: {
    light: {
      primary: '#6366f1',
      secondary: '#ec4899',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b',
      textSecondary: '#64748b',
      border: '#e2e8f0',
    },
    dark: {
      primary: '#818cf8',
      secondary: '#f472b6',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      border: '#334155',
    },
  },

  // Error Messages
  ERROR_MESSAGES: {
    invalidCity: 'City not found. Please try another search.',
    apiError: 'Failed to fetch weather data. Please try again.',
    networkError: 'Network error. Please check your connection.',
    geolocationError: 'Unable to get your location. Please enable location services.',
    permissionDenied: 'Location permission denied. Please enable it in browser settings.',
    timeout: 'Request timed out. Please try again.',
    invalidApiKey: 'Invalid API key. Please check your configuration.',
  },
};

// Save API Key to localStorage
function setApiKey(key) {
  localStorage.setItem(CONFIG.STORAGE_KEYS.apiKey, key);
  CONFIG.API_KEY = key;
}

// Get API Key
function getApiKey() {
  return CONFIG.API_KEY;
}
