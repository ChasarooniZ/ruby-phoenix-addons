import {
  haoJinDeath,
  haoJinReborn,
} from "./animations/chapter_3/haoJinDeath.js";
import { hexCrawlHelper } from "./hexCrawlHelper.js";
import { timeTracker } from "./timeTracker.js";

export function registerAPI() {
  game.rubyPhoenixAddons = {
    api: {
      timeTracker: {
        render: timeTracker,
      },
      hexCrawlHelper: hexCrawlHelper,
      animation: {
        chapter_3: {
          haoJinDeath,
          haoJinReborn,
        },
      },
    },
  };
}
