import { MODULE_ID } from "./const.js";

export function registerMyTours() {
  game.tours.register(MODULE_ID, "welcome", new Tour(welcomeTour));
}

const welcomeTour = {
  title: `${MODULE_ID}.tours.welcome.title`,
  description: `${MODULE_ID}.tours.welcome.desc`,
  canBeResumed: true,
  display: true,
  steps: [
    {
      id: `compendiums`,
      selector: `.tabs>a[data-tab='compendium']`,
      title: `${MODULE_ID}.tours.welcome.compendiums.title`,
      content: `${MODULE_ID}.tours.welcome.compendiums.content`,
      sidebarTab: `compendium`,
    },
    {
      id: `adventures`,
      selector: `.compendium[data-entry-id='fist-of-the-ruby-phoenix-addons.fist-of-the-ruby-phoenix-addons']`,
      title: `${MODULE_ID}.tours.welcome.adventures.title`,
      content: `${MODULE_ID}.tours.welcome.adventures.content`,
    },
    {
      id: `maps`,
      selector: `.compendium[data-entry-id='fist-of-the-ruby-phoenix-addons.fist-of-the-ruby-phoenix-addons-maps']`,
      title: `${MODULE_ID}.tours.welcome.maps.title`,
      content: `${MODULE_ID}.tours.welcome.maps.content`,
    },
  ],
};
