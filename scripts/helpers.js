import { MODULE_ID } from "./const.js";

/**
 * Localizes String
 * @param {string} str String to localize
 * @param {Object} options Extra options for localization
 * @returns {string} localized string
 */
export function localize(str, options = {}) {
  return game.i18n.format(`${MODULE_ID}.${str}`, options);
}


export function getSetting(setting) {
  return game.settings.get(MODULE_ID, setting);
}