import { MODULE_ID } from "./const.js";

export function registerSettings() {
  game.settings.register(MODULE_ID, `time-tracker.enabled`, {
    name: game.i18n.localize(
      `${MODULE_ID}.module-settings.time-tracker.enabled.name`
    ),
    hint: game.i18n.localize(
      `${MODULE_ID}.module-settings.time-tracker.enabled.hint`
    ),
    scope: `world`,
    config: true,
    default: false,
    type: Boolean,
    requiresReload: true,
  });
}
