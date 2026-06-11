import { MODULE_ID, UUIDS } from "./const.js";

export function crowdMeterSetup() {
  if (window.indicatorLevel === undefined) window.indicatorLevel = 0;

  game.socket.on(`module.${MODULE_ID}`, (data, user) => {
    if (data.type === "updateCrowdFavor") {
      const { crowdFavor, visible } = data;
      const alreadyUpToDate = window.indicatorLevel === crowdFavor;
      if (visible) {
        if (!document.getElementById("crowd-favor")) createCrowdFavorMeter();
      } else {
        deleteCrowdFavorMeter();
      }
      if (alreadyUpToDate) return;
      window.indicatorLevel = crowdFavor;
      updateNeedle();
    }
  });
}

const N = 5;
const PI = Math.PI;

const segmentAngleAmount = PI / N;

const size = 300;

const centerX = size / 2;
const centerY = size * 0.44;
const outerRadius = size * 0.4;
const innerRadius = size * 0.2;
const viewBoxWidth = size;
const viewboxHeight = centerY + size * 0.1;
const labelY = viewboxHeight - 2;
const fontSize = Math.round(size * 0.06);
const strokeW = Math.max(2, Math.round(size * 0.008));

export function createCrowdFavorMeter() {
  const html = `
<div id="crowd-favor" data-tooltip="${tooltipText(0)}" data-tooltip-direction="UP" style="width:${size}px;">
  <svg id="crowd-favor-svg" viewBox="0 0 ${viewBoxWidth} ${viewboxHeight}" width="${size}" height="${Math.round(viewboxHeight)}"
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="half-circle-clip">
        <rect x="0" y="0" width="${viewBoxWidth}" height="${centerY}"/>
      </clipPath>
    </defs>
    <rect x="0" y="0" width="${viewBoxWidth}" height="${viewboxHeight}" fill="transparent" id="gauge-hitbox"/>
    <g clip-path="url(#half-circle-clip)">
      <path id="favorSegment0" fill="#E24B4A" stroke="#000" stroke-width="${strokeW}"/>
      <path id="favorSegment1" fill="#EF9F27" stroke="#000" stroke-width="${strokeW}"/>
      <path id="favorSegment2" fill="#97C459" stroke="#000" stroke-width="${strokeW}"/>
      <path id="favorSegment3" fill="#1D9E75" stroke="#000" stroke-width="${strokeW}"/>
      <path id="favorSegment4" fill="#378ADD" stroke="#000" stroke-width="${strokeW}"/>
    </g>
    <polygon id="crowd-needle" points="0,0 0,0 0,0 0,0" fill="#ffffffff" stroke="#000" stroke-width="1"/>
    <text id="crowd-label" x="${centerX}" y="${labelY}" text-anchor="middle" font-size="${fontSize}"
        font-weight="500" fill="#ffffffff" paint-order: "stroke">0</text>
  </svg>
</div>
`;

  document.getElementById("crowd-favor")?.remove();
  const playerList = document.querySelector("aside#players");
  playerList.insertAdjacentHTML("afterend", html);

  for (let i = 0; i < N; i++) {
    document
      .getElementById(`favorSegment${i}`)
      .setAttribute(
        "d",
        segmentPath(
          PI - i * segmentAngleAmount,
          PI - (i + 1) * segmentAngleAmount,
        ),
      );
  }

  updateNeedle();

  if (game.user.isGM) {
    const widget = document.getElementById("crowd-favor");
    widget.addEventListener("click", onLeftClick, { capture: true });
    widget.addEventListener("contextmenu", onRightClick, { capture: true });
  }
}

function tooltipText(lvl) {
  if (lvl < 0)
    return `+${Math.abs(lvl)} Bonus to all checks and saves for the Rival team`;
  if (lvl === 0) return `The crowd favors no one`;
  return `+${lvl} bonus to all checks and saves for your team`;
}

function levelToAngle(lvl) {
  const segIndex = lvl + 2;
  return PI - (segIndex + 0.5) * segmentAngleAmount;
}

function updateNeedle() {
  const angle = levelToAngle(window.indicatorLevel);
  const tipDist = outerRadius - size * 0.04;
  const wideDist = size * 0.06;
  const tailDist = -size * 0.05;
  const halfW = size * 0.025;

  const [tipX, tipY] = getPoint(angle, tipDist);
  const [wideX, wideY] = getPoint(angle, wideDist);
  const [tailX, tailY] = getPoint(angle, tailDist);

  const perpendicularAngle = angle + PI / 2;
  const leftX = wideX + halfW * Math.cos(perpendicularAngle);
  const leftY = wideY - halfW * Math.sin(perpendicularAngle);
  const rightX = wideX - halfW * Math.cos(perpendicularAngle);
  const rightY = wideY + halfW * Math.sin(perpendicularAngle);

  document
    .getElementById("crowd-needle")
    .setAttribute(
      "points",
      `${tipX},${tipY} ${leftX},${leftY} ${tailX},${tailY} ${rightX},${rightY}`,
    );
  document.getElementById("crowd-label").textContent =
    `${window.indicatorLevel}`;
  document
    .getElementById("crowd-favor")
    .setAttribute("data-tooltip", tooltipText(window.indicatorLevel));
  game.tooltip.activate(document.getElementById("crowd-favor"), {
    text: tooltipText(window.indicatorLevel),
    direction: "UP",
  });
}

function onLeftClick(e) {
  if (e.shiftKey) {
    hideAllCrowdFavor();
  } else {
    increaseAllCrowdFavor();
  }
}
function onRightClick(e) {
  decreaseAllCrowdFavor();
}

function getPoint(angle, length) {
  return [
    centerX + length * Math.cos(angle),
    centerY - length * Math.sin(angle),
  ];
}

function segmentPath(a1, a2) {
  const [ox1, oy1] = getPoint(a1, outerRadius),
    [ox2, oy2] = getPoint(a2, outerRadius);
  const [ix1, iy1] = getPoint(a2, innerRadius),
    [ix2, iy2] = getPoint(a1, innerRadius);
  const lg = a1 - a2 > PI ? 1 : 0;
  return (
    `M${ox1} ${oy1} A${outerRadius} ${outerRadius} 0 ${lg} 1 ${ox2} ${oy2} ` +
    `L${ix1} ${iy1} A${innerRadius} ${innerRadius} 0 ${lg} 0 ${ix2} ${iy2} Z`
  );
}

export function deleteCrowdFavorMeter() {
  document.getElementById("crowd-favor")?.remove();
}

function increaseAllCrowdFavor() {
  if (window.indicatorLevel < 2) {
    window.indicatorLevel++;

    deleteExistingEffects();
    if (window.indicatorLevel !== 0) {
      addBoost(window.indicatorLevel > 0, Math.abs(window.indicatorLevel));
    }
  }
  updateNeedle();
  game.socket.emit(`module.${MODULE_ID}`, {
    type: "updateCrowdFavor",
    crowdFavor: window.indicatorLevel,
    visible: true,
  });
}

function decreaseAllCrowdFavor() {
  if (window.indicatorLevel > -2) {
    window.indicatorLevel--;
    deleteExistingEffects();
    if (window.indicatorLevel !== 0) {
      addBoost(window.indicatorLevel > 0, Math.abs(window.indicatorLevel));
    }
  }
  updateNeedle();
  game.socket.emit(`module.${MODULE_ID}`, {
    type: "updateCrowdFavor",
    crowdFavor: window.indicatorLevel,
    visible: true,
  });
}

export function showAllCrowdFavor() {
  createCrowdFavorMeter();
  game.socket.emit(`module.${MODULE_ID}`, {
    type: "updateCrowdFavor",
    crowdFavor: false,
    visible: 0,
  });
}

export function hideAllCrowdFavor() {
  deleteCrowdFavorMeter();
  game.socket.emit(`module.${MODULE_ID}`, {
    type: "updateCrowdFavor",
    crowdFavor: false,
    visible: 0,
  });
}

async function deleteExistingEffects() {
  const allTokens = canvas.tokens.placeables.filter(
    (t) =>
      t.actor.rollOptions.all["self:effect:crowd-boost-1"] ||
      t.actor.rollOptions.all["self:effect:crowd-boost-2"],
  );

  await Promise.allSettled(
    allTokens.map((t) => {
      const tokEffectIDs = t.actor.items.contents
        .filter((i) => i?.slug?.startsWith("effect-crowd-boost"))
        .map((i) => i.id);
      return t.actor.deleteEmbeddedDocuments("Item", tokEffectIDs);
    }),
  );
}

async function addBoost(isAlly, level) {
  const tokens = canvas.tokens.placeables.filter(
    (t) =>
      (isAlly
        ? t.document.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY
        : t.document.disposition !== CONST.TOKEN_DISPOSITIONS.FRIENDLY &&
          (!game.combat || (game.combat && t.inCombat))) &&
      t.actor.type !== "loot",
  );

  const uuid = UUIDS.EFFECTS.CROWD_BOOST[level];
  const item = await fromUuid(uuid);
  await Promise.allSettled(
    tokens.map((t) => t.actor.createEmbeddedDocuments("Item", [item])),
  );
}
