const MIN = { x: 2800, y: 1700 };
const MAX = { x: 6600, y: 4600 };
async function freezeRandomPositions() {
  if (!token) {
    ui.notifications.error(
      "Please select the Freezing Tile Hazard token you are using in initiative",
    );
    return;
  }

  const count = getCount(token.actor.rollOptions.all);
  const centers = pick2x2Centers(MIN, MAX, count);

  const item = {
    name: "Frozen Arena Squares",
    type: "effect",
    img: "icons/magic/water/barrier-ice-crystal-wall-faceted-light.webp",
    system: {
      duration: {
        value: 1,
        unit: "rounds",
        expiry: "turn-start",
        sustained: false,
      },
    },
  };
  const it = await token.actor.createEmbeddedDocuments("Item", [item]);

  makeIce(centers, it);
}

function makeIce(positions, item) {
  const scale = 1.1;
  const duration = {
    in: 1000,
    out: 1000,
    delay: 250,
  };
  const seq = new Sequence()
    .sound()
    .file("graphics-sfx.magic.ice.cast.04.06")
    .volume(0.4);
  let cnt = 0;
  for (const pos of positions) {
    seq
      .effect()
      // .async()
      .file(
        "modules/jb2a_patreon/Library/Generic/Impact/FrostImpact_01_Regular_Blue_Thumb.webp",
      )
      .name("Grand Arena Ice")
      .belowTokens()
      // .delay(2500)
      .atLocation(pos)
      .tieToDocuments(item)
      .persist()
      .size(2 * scale, { gridUnits: true })
      .fadeIn(duration.in, { ease: "easeOutSine" })
      .scaleIn(0.5, duration.in)
      .fadeOut(duration.out)
      .scaleOut(0.5, duration.out, { ease: "easeOutCubic" })
      .extraEndDuration(duration.out)
      .delay(duration.delay * cnt);
    cnt++;
  }
  seq.play({ preload: true });
}

function getCount(rollOptions) {
  if (rollOptions["self:effect:remote-sensor-count:4"]) {
    return 4;
  } else if (rollOptions["self:effect:remote-sensor-count:3"]) {
    return 3;
  } else if (rollOptions["self:effect:remote-sensor-count:2"]) {
    return 2;
  } else if (rollOptions["self:effect:remote-sensor-count:1"]) {
    return 1;
  } else {
    return 4;
  }
}

function pick2x2Centers(min, max, count) {
  const size = canvas.grid.size;

  const colMin = Math.ceil((min.x + size) / size);
  const colMax = Math.floor((max.x - size) / size);
  const rowMin = Math.ceil((min.y + size) / size);
  const rowMax = Math.floor((max.y - size) / size);

  const chosen = [];

  let attempts = 0;
  while (chosen.length < count && attempts < 2000) {
    attempts++;
    const col = colMin + Math.floor(Math.random() * (colMax - colMin + 1));
    const row = rowMin + Math.floor(Math.random() * (rowMax - rowMin + 1));

    const ok = chosen.every(
      (c) => Math.abs(c.col - col) >= 2 || Math.abs(c.row - row) >= 2,
    );
    if (ok) chosen.push({ col, row });
  }

  return chosen.map(({ col, row }) => ({ x: col * size, y: row * size }));
}
