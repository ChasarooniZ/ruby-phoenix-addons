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

  // game.settings.register(MODULE_ID, `first-time.guide`, {
  //   name: "",
  //   hint: "",
  //   scope: `world`,
  //   config: false,
  //   default: true,
  //   type: Boolean,
  // });
}
