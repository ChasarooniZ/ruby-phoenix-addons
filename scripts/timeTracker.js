import {
  DEFAULT_SEGMENT_COUNT,
  MODULE_ID,
  TIME_TRACKING_SETTING_KEY,
  VISIBILITY_KEY,
} from "./const.js";

// Note: this code is hella scuffed in scavenged from a ton of misc sources, so very brittle and likely to break

// --- INIT & SOCKET ---
export async function timeTracker() {
  // Register setting if not present
  if (
    game.settings.settings.get(`${MODULE_ID}.${TIME_TRACKING_SETTING_KEY}`)
      ?.length !== DEFAULT_SEGMENT_COUNT
  ) {
    await game.settings.register(MODULE_ID, TIME_TRACKING_SETTING_KEY, {
      name: "Time Tracker State",
      default: Array(DEFAULT_SEGMENT_COUNT).fill(false),
      type: Array,
      scope: "world",
      config: false,
    });
  }
  // Listen for socket updates
  if (!window[`${MODULE_ID}_socketRegistered`]) {
    game.socket.on(`module.${MODULE_ID}`, (data) => {
      if (data.state) applyState(data.state);
    });
    window[`${MODULE_ID}_socketRegistered`] = true;
  }
  // Listen for setting changes
  Hooks.on("updateSetting", (setting) => {
    if (setting.key === `${MODULE_ID}.${TIME_TRACKING_SETTING_KEY}`) {
      applyState(setting.value);
    }
  });
  // Initial draw
  let state = game.settings.get(MODULE_ID, TIME_TRACKING_SETTING_KEY);
  applyState(state);
}

function applyState(state) {
  createOrUpdateTracker(state);
}

// --- SETTINGS & SYNC ---
async function saveState(state) {
  await game.settings.set(MODULE_ID, TIME_TRACKING_SETTING_KEY, state);
}

function sendUpdate(state) {
  game.socket.emit(`module.${MODULE_ID}`, { state });
}

// --- TIME LABELS ---
function generateTimeLabels() {
  const labels = [];
  let hour = 8;
  let minute = 0;
  for (let i = 0; i < DEFAULT_SEGMENT_COUNT; i++) {
    const suffix = hour < 12 ? "am" : "pm";
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    labels.push(
      `${displayHour}:${minute.toString().padStart(2, "0")}${suffix}`
    );
    minute += 30;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }
  return labels;
}

// --- TRACKER UI ---
function getTrackerVisible() {
  const val = localStorage.getItem(VISIBILITY_KEY);
  return val === null ? true : val === "true";
}
function setTrackerVisible(val) {
  localStorage.setItem(VISIBILITY_KEY, val ? "true" : "false");
}

function createOrUpdateTracker(state) {
  // Remove old wrapper if present
  let wrapper = document.getElementById("timeTrackerWrapper");
  if (wrapper) wrapper.remove();

  // Create wrapper
  wrapper = document.createElement("div");
  wrapper.id = "timeTrackerWrapper";

  // Create row container for segments + button
  const row = document.createElement("div");
  row.id = "timeSegmentsRow";

  // Collapse/expand button (always at right)
  const visible = getTrackerVisible();
  const toggleBtn = document.createElement("div");
  toggleBtn.id = "timeTrackerToggleBtn";
  toggleBtn.title = visible ? "Collapse Time Tracker" : "Expand Time Tracker";
  toggleBtn.setAttribute(
    "data-tooltip",
    visible ? "Collapse Time Tracker" : "Expand Time Tracker"
  );
  toggleBtn.setAttribute("data-tooltip-direction", "DOWN");
  toggleBtn.textContent = visible ? "▲" : "▼";
  toggleBtn.onclick = () => {
    setTrackerVisible(!visible);
    createOrUpdateTracker(state);
  };

  // Create segments if visible, else add a flexible filler
  if (visible) {
    generateTimeLabels().forEach((label, i) => {
      const segment = document.createElement("div");
      segment.className = "segment";
      segment.setAttribute(
        "data-tooltip",
        `${label}<hr>
      <p><b>Increase Time: </b><span class='reference'>${game.i18n.localize(
        "CONTROLS.LeftClick"
      )}</span></p>
      <p><b>Decrease Time: </b><span class='reference'>${game.i18n.localize(
        "CONTROLS.RightClick"
      )}</span></p>`
      );
      segment.setAttribute("data-tooltip-direction", "DOWN");
      if (state[i]) segment.classList.add("colored");
      const [time, ampm] = label.split(/(am|pm)/);
      if (time.endsWith(":00")) {
        // --- SUN ICON above 12pm ---
        if (label === "12:00pm") {
          const sunDiv = document.createElement("div");
          sunDiv.innerHTML = `<i class="fas fa-sun sun-icon"></i>`;
          segment.appendChild(sunDiv);
        }
        const labelDiv = document.createElement("div");
        labelDiv.className = "segment-label";
        labelDiv.textContent = time.replace(":00", ""); // + ampm;
        segment.appendChild(labelDiv);
      }
      row.appendChild(segment);
    });
  } else {
    // Add a flexible filler to keep the button at the right
    const filler = document.createElement("div");
    filler.style.flex = "1 1 auto";
    filler.style.minWidth = "1px";
    filler.style.maxWidth = "1250px";
    filler.style.pointerEvents = "none";
    row.appendChild(filler);
  }
  row.appendChild(toggleBtn);
  if (!visible) {
    // Make the whole row ignore pointer events except the toggle button
    row.style.pointerEvents = "none";
    toggleBtn.style.pointerEvents = "auto";
  } else {
    row.style.pointerEvents = "auto";
    toggleBtn.style.pointerEvents = "auto";
  }

  // Only GMs can interact (remove this check if you want all users to interact)
  if (game.user.isGM && visible) {
    row.onclick = async (e) => {
      if (e.target.classList.contains("segment")) {
        e.preventDefault();
        const segments = Array.from(row.getElementsByClassName("segment"));
        const next = segments.findIndex(
          (seg) => !seg.classList.contains("colored")
        );
        if (next !== -1) {
          state[next] = true;
        } else {
          state = Array(segments.length).fill(false);
          state[0] = true;
        }
        await saveState(state);
        sendUpdate(state);
      }
    };
    row.oncontextmenu = async (e) => {
      if (e.target.classList.contains("segment")) {
        e.preventDefault();
        const segments = Array.from(row.getElementsByClassName("segment"));
        const prev =
          segments.length -
          1 -
          [...segments]
            .reverse()
            .findIndex((seg) => seg.classList.contains("colored"));
        if (prev !== -1 && state[prev]) {
          state[prev] = false;
        } else {
          state = Array(segments.length).fill(true);
          state[segments.length - 1] = true;
        }
        await saveState(state);
        sendUpdate(state);
      }
    };
  }

  wrapper.appendChild(row);
  document.body.appendChild(wrapper);

  // Responsive: Re-render on resize
  if (!window._timeTrackerResizeHandler) {
    window._timeTrackerResizeHandler = () => {
      createOrUpdateTracker(state);
    };
    window.addEventListener("resize", window._timeTrackerResizeHandler);
  }
}
