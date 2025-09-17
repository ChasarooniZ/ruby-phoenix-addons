import { summonTerracotta } from "./animations/chapter_2/terracottaSummon.js";
import {
  haoJinDeath,
  haoJinReborn,
} from "./animations/chapter_3/haoJinDeath.js";
import { pressurePointAttack } from "./animations/chapter_3/pressurePointAttack.js";
import { whirlwindToss } from "./animations/chapter_3/whirlWindToss.js";
import { hexCrawlHelper } from "./bonmuHexCrawlManager.js";
import { timeTracker } from "./timeTracker.js";

export function registerAPI() {
  game.rubyPhoenixAddons = {
    api: {
      timeTracker: {
        render: timeTracker,
      },
      hexCrawlHelper: hexCrawlHelper,
      animation: {
        chapter_2: {
          summonTerracotta
        },
        chapter_3: {
          haoJinDeath,
          haoJinReborn,
          lightkeepers: {
            whirlwindToss,
            pressurePointAttack
          }
        },
      },
    },
  };
}
