import { registerAPI } from "./api.js";
import { getSetting } from "./helpers.js";
import { registerSettings } from "./settings.js";
import { timeTracker } from "./timeTracker.js";

Hooks.once('init', async function() {
    registerSettings();
});

Hooks.once('ready', async function() {
    registerAPI();
    if (getSetting('time-tracker.enabled')) {
        timeTracker();
    }
});
