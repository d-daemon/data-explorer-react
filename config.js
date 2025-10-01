/**
 * Central application configuration
 * This file defines the app name and base path once and can be imported by all other files.
 * Both APP_NAME and BASE_PATH can be overridden via environment variables.
 */

const APP_NAME = process.env.APP_NAME || 'data-explorer';
const BASE_PATH = process.env.BASE_PATH || `/${APP_NAME}`;

module.exports = {
  APP_NAME,
  BASE_PATH
}; 