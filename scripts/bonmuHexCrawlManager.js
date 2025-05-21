import { localize } from "./helpers.js";

// Helper: Find all notes in a given hex
function notesInHex(col, row) {
  return canvas.notes.placeables.filter((note) => {
    const { i: noteCol, j: noteRow } = canvas.grid.getOffset(note.center);
    return noteCol === col && noteRow === row;
  });
}

// Helper: Find all drawings in a given hex, categorized by cost type
function drawingsInHex(col, row) {
  return canvas.drawings.placeables
    .filter((drawing) => {
      const { i: drawingCol, j: drawingRow } = canvas.grid.getOffset(
        drawing.center
      );
      return drawingCol === col && drawingRow === row;
    })
    .map((drawing) => {
      const text = drawing.document.text?.trim() || "";
      let costType = null;
      if (text.startsWith("➡")) costType = "speed";
      else if (text.startsWith("⚯")) costType = "recon";
      return { drawing, costType, text };
    });
}

async function setJournalPermission(journalPage, level) {
  const permissions = duplicate(journalPage.ownership);
  permissions.default = level;
  await journalPage.update({ ownership: permissions });
}

export async function hexCrawlHelper() {
  // Main macro logic
  ui.notifications.info(localize("dialog.hexcrawl-helper.click-to-select"));
  const handler = async (event) => {
    const pos = event.interactionData.origin;
    const { i: col, j: row } = canvas.grid.getOffset(pos);
    canvas.stage.off("mousedown", handler);

    const notes = notesInHex(col, row);
    const drawings = drawingsInHex(col, row);
    const speedDrawings = drawings.filter((d) => d.costType === "speed");
    const reconDrawings = drawings.filter((d) => d.costType === "recon");

    if (!notes.length && !speedDrawings.length && !reconDrawings.length)
      return ui.notifications.warn(
        localize("dialog.hexcrawl-helper.nothing-found")
      );

    // Build dialog content
    let content = `<div class="form-group"><h3>${
      (localize("dialog.hexcrawl-helper.hex-content"),
      { col: String(col), row: String(row) })
    }</h3>`;

    // Notes section
    if (notes.length) {
      content += `<div><b>${localize(
        "dialog.hexcrawl-helper.notes"
      )}</b></div>`;
      notes.forEach((note) => {
        const entryName =
          note.document.text ||
          localize("dialog.hexcrawl-helper.unnamed-location");
        const icon =
          note.document.page?.ownership?.default ===
          CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED
            ? '<i class="fa-solid fa-location-dot"></i>'
            : '<i class="fa-solid fa-location-dot-slash"></i>';
        const tooltip =
          note.document.page?.ownership?.default ===
          CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED
            ? localize("dialog.hexcrawl-helper.visible")
            : localize("dialog.hexcrawl-helper.hidden");
        content += `
          <div>
            <label>
              <input type="checkbox" name="note" value="${note.id}">
              ${entryName} <span data-tooltip-direction="UP" data-tooltip="${tooltip}">(${icon})</span>
            </label>
          </div>
        `;
      });
      content += `
        <div style="margin-bottom: 8px; display:flex;">
          <button type="button" class="check-section" data-section="note" style="flex: 1 1 auto;margin-right:5px;"><i class="fa-solid fa-check-double"></i> ${localize(
            "dialog.hexcrawl-helper.buttons.check-all"
          )}</button>
          <button type="button" class="uncheck-section" data-section="note" style="flex: 1 1 auto;"><i class="fa-regular fa-square"></i> ${localize(
            "dialog.hexcrawl-helper.buttons.uncheck-all"
          )}</button>
        </div>
      `;
    }

    // Speed Cost drawings section
    if (speedDrawings.length) {
      content += `<hr><div><b>${localize(
        "dialog.hexcrawl-helper.cost-labels"
      )}</b></div>`;
      [
        ...speedDrawings.map((d) => ({
          name: `<i class="fa-solid fa-person-running"></i> ${localize(
            "dialog.hexcrawl-helper.movement-cost"
          )}`,
          id: d.drawing.id,
          hidden: d.drawing?.document?.hidden,
        })),
        ...reconDrawings.map((d) => ({
          name: `<i class="fa-solid fa-binoculars"></i> ${localize(
            "dialog.hexcrawl-helper.reconnoiter-cost"
          )}`,
          id: d.drawing.id,
          hidden: d.drawing?.document?.hidden,
        })),
      ].forEach((obj) => {
        console.log({ obj });
        const icon = obj.hidden
          ? '<i class="fa-solid fa-eye-slash"></i>'
          : '<i class="fa-solid fa-eye"></i>';
        const tooltip = obj.hidden
          ? localize("dialog.hexcrawl-helper.visible")
          : localize("dialog.hexcrawl-helper.hidden");

        content += `
          <div>
            <label>
              <input type="checkbox" name="speed" value="${obj.id}">
              ${obj.name} <span data-tooltip-direction="UP" data-tooltip="${tooltip}">(${icon})</span>
            </label>
          </div>
        `;
      });
    }

    content += `</div>`;

    new Dialog({
      title: localize("dialog.hexcrawl-helper.title"),
      content,
      buttons: {
        hide: {
          label: localize("dialog.hexcrawl-helper.buttons.hide"),
          icon: '<i class="fa-solid fa-hood-cloak"></i>',
          callback: async (html) => {
            // Hide notes
            const color = Color.fromString("#969696");
            const notes = html.find("input[name=note]:checked");
            for (const checkbox of notes) {
              const note = notes.find((n) => n.id === checkbox.value);
              if (note?.document?.page)
                await setJournalPermission(
                  note.document.page,
                  CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE
                );
              await note.document.update({ texture: { tint: color } });
            }
            // Hide speed drawings
            const labels = html.find("input[name=speed]:checked");
            for (const checkbox of labels) {
              const obj =
                speedDrawings.find((d) => d.drawing.id === checkbox.value) ??
                reconDrawings.find((d) => d.drawing.id === checkbox.value);
              if (obj) await obj.drawing.document.update({ hidden: true });
            }
            ui.notifications.info(
              `${localize("dialog.hexcrawl-helper.hid")} ${notes.join(", ")}`
            );
          },
        },
        reveal: {
          label: localize("dialog.hexcrawl-helper.buttons.reveal"),
          icon: '<i class="fa-solid fa-flashlight"></i>',
          callback: async (html) => {
            // Reveal only checked items
            const color = Color.fromString("#ffffff");
            const notes = html.find("input[name=note]:checked");
            for (const checkbox of notes) {
              const note = notes.find((n) => n.id === checkbox.value);
              if (note?.document?.entry)
                await setJournalPermission(
                  note.document.page,
                  CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED
                );
              await note.document.update({ texture: { tint: color } });
            }
            const labels = html.find("input[name=speed]:checked");
            for (const checkbox of labels) {
              const obj =
                speedDrawings.find((d) => d.drawing.id === checkbox.value) ??
                reconDrawings.find((d) => d.drawing.id === checkbox.value);
              if (obj) await obj.drawing.document.update({ hidden: false });
            }
            ui.notifications.info(
              `${localize("dialog.hexcrawl-helper.revealed")} ${notes.join(
                ", "
              )}`
            );
          },
        },
        close: {
          label: localize("dialog.hexcrawl-helper.buttons.close"),
          icon: '<i class="fa-solid fa-circle-xmark"></i>',
        },
      },
      render: (html) => {
        // Section check/uncheck
        html.find(".check-section").click((ev) => {
          const section = ev.currentTarget.dataset.section;
          html.find(`input[name=${section}]`).prop("checked", true);
        });
        html.find(".uncheck-section").click((ev) => {
          const section = ev.currentTarget.dataset.section;
          html.find(`input[name=${section}]`).prop("checked", false);
        });
      },
    }).render(true);
  };

  canvas.stage.once("mousedown", handler);
}
