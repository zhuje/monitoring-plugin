// Use build-time injected proxy URL for Perses plugins
declare const PERSES_PROXY_BASE_URL: string;

// Note: Global variables are now set via webpack BannerPlugin
// This ensures they're available before Module Federation initializes

// Export for use in other modules
export const PROXY_BASE_URL = PERSES_PROXY_BASE_URL;

// Set up window globals for plugin system compatibility
// This is needed for plugins that use getPublicPath in their mf-manifest.json
const PERSES_APP_CONFIG = {
  api_prefix: PROXY_BASE_URL,
};

// Make globals available on window object
window.PERSES_APP_CONFIG = PERSES_APP_CONFIG;
window.PERSES_PLUGIN_ASSETS_PATH = PROXY_BASE_URL;

// TypeScript declarations for global window variables
declare global {
  interface Window {
    /**
     * Perses app configuration made available globally for plugin compatibility
     */
    PERSES_APP_CONFIG: typeof PERSES_APP_CONFIG;
    /**
     * Plugin assets path used by module federation for loading plugin assets
     * Set to the same value as the proxy base URL
     */
    PERSES_PLUGIN_ASSETS_PATH: string;
  }
}
