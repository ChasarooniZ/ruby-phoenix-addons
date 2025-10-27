import { MODULE_ID } from "./const.js";

export function setupAdventureOnlyUpdateStatBlocks() {
  if (game.settings.get(MODULE_ID, "import-statblock-only")) {
    Hooks.on("preImportAdventure", backupData);
    Hooks.on("closeAdventureImporter", loadBackup);
  }
}

async function backupData(_adventure, _info, _misc, content) {
  window.rubyPhoenixAddonsImportStarted = true;
  const { Actor: actors, Item: items } = content;
  const actorIDs = actors.map((a) => a._id);
  const itemIDs = items.map((i) => i._id);

  const totalCount = actorIDs.length + itemIDs.length;
  let processedCount = 0;

  const updates = {};

  // Batch actor updates
  const actorUpdates = {};
  for (const actorID of actorIDs) {
    const actor = game.actors.get(actorID);
    if (!actor) {
      processedCount++;
      continue;
    }

    const backupData = {
      img: actor.img,
      flags: actor.flags,
      name: actor.name,
      "system.details.blurb": actor?.system?.details?.blurb,
      "system.details.privateNotes": actor?.system?.details?.privateNotes,
      "system.details.publicNotes": actor?.system?.details?.publicNotes,
      "prototypeToken.name": actor?.prototypeToken?.name,
      "prototypeToken.texture": actor?.prototypeToken?.texture,
      "prototypeToken.ring": actor?.prototypeToken?.ring,
      "prototypeToken.turnMarker": actor?.prototypeToken?.turnMarker,
    };

    actorUpdates[actorID] = backupData;
    processedCount++;
    updateProgress(processedCount, totalCount, actor.name, "actor");
  }

  updates.actors = actorUpdates;

  // Batch item updates
  const itemUpdates = {};
  for (const itemID of itemIDs) {
    const item = game.items.get(itemID);
    if (!item) {
      processedCount++;
      continue;
    }

    const backupData = {
      img: item.img,
      flags: item.flags,
      name: item.name,
    };

    itemUpdates[itemID] = backupData;
    processedCount++;
    updateProgress(processedCount, totalCount, item.name, "item");
  }

  updates.items = itemUpdates;
  await game.settings.set(MODULE_ID, "object-info-backup", updates);
}

async function loadBackup(importer) {
  if (
    !window.rubyPhoenixAddonsImportStarted ||
    importer?.object?.pack !==
      "fist-of-the-ruby-phoenix-addons.fist-of-the-ruby-phoenix-addons"
  )
    return;
  window.rubyPhoenixAddonsImportStarted = false;

  const updates = game.settings.get(MODULE_ID, "object-info-backup");

  const actorIDs = Object.keys(updates.actors);
  const itemIDs = Object.keys(updates.items);

  const actors = game.actors.contents.filter((a) => actorIDs.includes(a.id));
  const items = game.items.contents.filter((i) => itemIDs.includes(i.id));
  const totalCount = actors.length + items.length;
  let processedCount = 0;

  // Batch actor restoration
  const actorUpdates = [];
  for (const actor of actors) {
    const backupData = updates.actors[actor.id];
    if (!backupData) {
      processedCount++;
      continue;
    }

    actorUpdates.push(
      actor.update(backupData).then(() => {
        processedCount++;
        updateProgress(processedCount, totalCount, actor.name, "actor", false);
      })
    );
  }

  await Promise.all(actorUpdates);

  // Batch item restoration
  const itemUpdates = [];
  for (const item of items) {
    const backupData = updates.items[item.id];
    if (!backupData) {
      processedCount++;
      continue;
    }

    itemUpdates.push(
      item.update(backupData).then(() => {
        processedCount++;
        updateProgress(processedCount, totalCount, item.name, "item", false);
      })
    );
  }

  await Promise.all(itemUpdates);

  await game.settings.set(MODULE_ID, "object-info-backup", {});
}

function updateProgress(processed, total, name, type = "actor", backup = true) {
  const pct = Math.round((processed / total) * 100);
  SceneNavigation.displayProgressBar({
    label: `${backup ? "Backed up" : "Restored"} ${type} '${name}' (${processed}/${total})`,
    pct: pct,
  });
}
