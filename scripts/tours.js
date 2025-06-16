import { MODULE_ID } from "./const.js";
import { localize } from "./helpers.js";

export function registerMyTours() {
  const tourData = getTourData();
  game.tours.register(MODULE_ID, "welcome", new SidebarTour(tourData.welcome));
}

function getTourData() {
  return {
    welcome: {
      title: localize(`tours.welcome.title`),
      description: localize(`tours.welcome.desc`),
      canBeResumed: true,
      display: true,
      steps: [
        {
          id: `compendiums`,
          selector: `.tabs>a[data-tab='compendium']`,
          title: localize(`tours.welcome.steps.compendiums.title`),
          content: localize(`tours.welcome.steps.compendiums.content`),
          sidebarTab: "compendium",
        },
        {
          id: `adventures`,
          selector: `input[type="search"]`,
          title: localize(`tours.welcome.steps.adventures.title`),
          content: localize(`tours.welcome.steps.adventures.content`),
        },
        {
          id: `maps`,
          selector: `input[type="search"]`,
          title: localize(`tours.welcome.steps.maps.title`),
          content: localize(`tours.welcome.steps.maps.content`),
        },
      ],
    },
  };
}
