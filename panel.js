// ===== keys for persistence =====
const NOTES_KEY = "sidekick_notes_v1";
const THEME_KEY = "sidekick_theme_v1"; // "light" | "dark"

// ===== elements =====
const toggle = document.getElementById("dark-toggle");
const noteArea = document.getElementById("note-area");

// --- tiny debounce helper ---
const debounce = (fn, ms = 300) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
};

// ===== init: restore theme + notes on open =====
(async function init() {
  try {
    const stored = await chrome.storage.local.get([NOTES_KEY, THEME_KEY]);
    const savedNotes = stored[NOTES_KEY] ?? "";
    const savedTheme = stored[THEME_KEY] ?? "light";

    // Theme
    document.body.classList.toggle("dark", savedTheme === "dark");
    document.body.classList.toggle("light", savedTheme !== "dark");
    toggle.checked = savedTheme === "dark";

    // Notes
    noteArea.value = savedNotes;
  } catch {
    // Fallback to localStorage if chrome.storage is unavailable
    const savedNotes = localStorage.getItem(NOTES_KEY) ?? "";
    const savedTheme = localStorage.getItem(THEME_KEY) ?? "light";
    document.body.classList.toggle("dark", savedTheme === "dark");
    document.body.classList.toggle("light", savedTheme !== "dark");
    toggle.checked = savedTheme === "dark";
    noteArea.value = savedNotes;
  }
})();

// ===== dark mode toggle (persist) =====
toggle.addEventListener("change", async () => {
  const isDark = toggle.checked;
  document.body.classList.toggle("dark", isDark);
  document.body.classList.toggle("light", !isDark);
  try {
    await chrome.storage.local.set({ [THEME_KEY]: isDark ? "dark" : "light" });
  } catch {
    localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
  }
});

// ===== notes persistence (debounced) =====
const saveNotes = debounce(async () => {
  const text = noteArea.value;
  try {
    await chrome.storage.local.set({ [NOTES_KEY]: text });
  } catch {
    localStorage.setItem(NOTES_KEY, text);
  }
}, 250);

noteArea.addEventListener("input", saveNotes);

// Extra safety: save on close (e.g., paste then immediately close)
window.addEventListener("beforeunload", () => {
  const text = noteArea.value;
  try {
    chrome.storage.local.set({ [NOTES_KEY]: text });
  } catch {
    localStorage.setItem(NOTES_KEY, text);
  }
});

// ===== tabs =====
document.getElementById("tab-dict").addEventListener("click", () => {
  document.getElementById("dictionary").classList.add("active");
  document.getElementById("notes").classList.remove("active");
});

document.getElementById("tab-notes").addEventListener("click", () => {
  document.getElementById("notes").classList.add("active");
  document.getElementById("dictionary").classList.remove("active");
});

// ===== dictionary: receive from content.js =====
window.addEventListener("message", (event) => {
  if (event.data?.type === "word") {
    const word = event.data.word;
    const msg = document.getElementById("dict-message");
    msg.innerHTML = `Looking up <strong>${word}</strong>...`;

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const definitions = data[0].meanings
            .map(m => `(${m.partOfSpeech}) ${m.definitions[0].definition}`)
            .join("<br>");
          msg.innerHTML = `<strong>${word}:</strong><br>${definitions}`;
        } else {
          msg.innerHTML = `No definition found for <strong>${word}</strong>.`;
        }
      })
      .catch(() => {
        msg.innerHTML = `Error fetching definition for <strong>${word}</strong>.`;
      });
  }
});
