/**
 * Theme Module
 * Handles dark/light mode toggle and theme persistence
 */

class Theme {
  static THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
  };

  /**
   * Initialize theme on app startup
   */
  static initialize() {
    const savedTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? this.THEMES.DARK : this.THEMES.LIGHT);

    this.setTheme(theme);
    this.setupThemeToggle();
  }

  /**
   * Set theme
   * @param {string} theme - 'light' or 'dark'
   */
  static setTheme(theme) {
    const html = document.documentElement;
    const isDark = theme === this.THEMES.DARK;

    html.setAttribute('data-theme', theme);
    localStorage.setItem(CONFIG.STORAGE_KEYS.theme, theme);

    // Update theme meta color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }

    // Update CSS variables
    this.updateCSSVariables(isDark);

    // Update toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.innerHTML = isDark ?
        '<span class="toggle-icon">☀️</span>' :
        '<span class="toggle-icon">🌙</span>';
      themeToggle.setAttribute('aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /**
   * Toggle between light and dark theme
   */
  static toggle() {
    const currentTheme = localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'light';
    const newTheme = currentTheme === this.THEMES.DARK ? this.THEMES.LIGHT : this.THEMES.DARK;
    this.setTheme(newTheme);
  }

  /**
   * Update CSS variables based on theme
   * @param {boolean} isDark - Whether dark theme is active
   */
  static updateCSSVariables(isDark) {
    const colors = isDark ? CONFIG.COLORS.dark : CONFIG.COLORS.light;
    const root = document.documentElement;

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }

  /**
   * Setup theme toggle button event listener
   */
  static setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggle());
    }
  }

  /**
   * Get current theme
   * @returns {string} Current theme ('light' or 'dark')
   */
  static getCurrentTheme() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.theme) || 'light';
  }

  /**
   * Check if dark mode is active
   * @returns {boolean} True if dark mode is active
   */
  static isDarkMode() {
    return this.getCurrentTheme() === this.THEMES.DARK;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Theme;
}
