import { registerAPI } from "./api.js";
import { getSetting } from "./helpers.js";
import { registerSettings } from "./settings.js";
import { timeTracker } from "./timeTracker.js";
import { registerMyTours } from "./tours.js";

Hooks.once("init", async function () {
  registerSettings();
});

Hooks.once("ready", async function () {
  registerAPI();
  if (getSetting("time-tracker.enabled")) {
    timeTracker();
  }
  registerMyTours();
  // if (getSetting("first-time.guide")) {
  //   game.settings.set(MODULE_ID, "first-time.guide", false);
  //   ChatMessage.create({
  //     content: `<h2>${localize(
  //       "fist-of-the-ruby-phoenix-addons.message.first-time.guide.title"
  //     )}</h2>`,
  //   });
  // }
});
