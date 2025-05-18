
import { hexCrawlHelper } from "./HexCrawlHelper.js";
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
