import { hexCrawlHelper } from "./hexCrawlHelper.js";
import { timeTracker } from "./timeTracker.js";

export function registerAPI() {
  game.rubyPhoenixAddons = {
    api: {
      timeTracker: {
        render: timeTracker,
      },
      hexCrawlHelper: hexCrawlHelper,
    },
  };
}
