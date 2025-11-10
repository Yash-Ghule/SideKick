// const blockedSites = ["mail.google.com", "docs.google.com"];

// if (!blockedSites.some(site => window.location.href.includes(site))) {
//   try {
//     createSidekickButton();
//     handleTextSelection();
//   } catch (error) {
//     console.warn("Sidekick extension failed on this page:", error);
//   }
// }

// function createSidekickButton() {
//   const button = document.createElement("img");
//   button.src = chrome.runtime.getURL("icons/icon32.png");
//   button.id = "sidekick-icon-button";
//   button.title = "Open Sidekick";

//   button.style.position = "fixed";
//   button.style.top = "50%";
//   button.style.left = "0";
//   button.style.width = "32px";
//   button.style.height = "32px";
//   button.style.cursor = "pointer";
//   button.style.zIndex = "999999";
//   button.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
//   button.style.borderRadius = "8px";
//   button.style.padding = "4px";
//   button.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";

//   // Drag icon
//   let isDragging = false;
//   let offsetX, offsetY;

//   button.onmousedown = (e) => {
//     isDragging = true;
//     offsetX = e.clientX;
//     offsetY = e.clientY;

//     document.onmousemove = (ev) => {
//       if (!isDragging) return;
//       const dx = ev.clientX - offsetX;
//       const dy = ev.clientY - offsetY;
//       button.style.left = button.offsetLeft + dx + "px";
//       button.style.top = button.offsetTop + dy + "px";
//       offsetX = ev.clientX;
//       offsetY = ev.clientY;
//     };

//     document.onmouseup = () => {
//       isDragging = false;
//       document.onmousemove = null;
//     };
//   };

//   button.addEventListener("click", () => togglePanel(button));
//   document.body.appendChild(button);
// }

// function togglePanel(iconButton) {
//   let wrapper = document.getElementById("sidekick-panel-wrapper");
//   if (wrapper) {
//     wrapper.remove();
//     return;
//   }

//   const iconRect = iconButton.getBoundingClientRect();
//   const isOnRightSide = iconRect.left > window.innerWidth / 2;

//   wrapper = document.createElement("div");
//   wrapper.id = "sidekick-panel-wrapper";
//   wrapper.style.position = "fixed";
//   wrapper.style.top = `${iconRect.top}px`;
//   wrapper.style.left = isOnRightSide
//     ? `${iconRect.left - 330}px`
//     : `${iconRect.right + 10}px`;
//   wrapper.style.zIndex = "999999";
//   wrapper.style.cursor = "move";
//   wrapper.style.pointerEvents = "auto"; // allow interaction

//   const iframe = document.createElement("iframe");
//   iframe.src = chrome.runtime.getURL("panel.html");
//   iframe.id = "sidekick-panel";
//   iframe.style.width = "320px";
//   iframe.style.height = "280px";
//   iframe.style.border = "none";
//   iframe.style.borderRadius = "16px";
//   iframe.style.display = "block";
//   iframe.style.pointerEvents = "auto"; // needed for iframe interaction

//   wrapper.appendChild(iframe);
//   document.body.appendChild(wrapper);

//   makeDraggable(wrapper);
// }

// function makeDraggable(elmnt) {
//   let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

//   elmnt.onmousedown = dragMouseDown;

//   function dragMouseDown(e) {
//     e.preventDefault();
//     pos3 = e.clientX;
//     pos4 = e.clientY;
//     document.onmouseup = closeDragElement;
//     document.onmousemove = elementDrag;
//   }

//   function elementDrag(e) {
//     e.preventDefault();
//     pos1 = pos3 - e.clientX;
//     pos2 = pos4 - e.clientY;
//     pos3 = e.clientX;
//     pos4 = e.clientY;

//     elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
//     elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
//   }

//   function closeDragElement() {
//     document.onmouseup = null;
//     document.onmousemove = null;
//   }
// }

// // Handle text selection
// function handleTextSelection() {
//   document.addEventListener("mouseup", () => {
//     const selectedText = window.getSelection().toString().trim();
//     if (selectedText.length > 0) {
//       if (!document.getElementById("sidekick-panel")) {
//         document.getElementById("sidekick-icon-button").click();
//         setTimeout(() => sendWordToPanel(selectedText), 400);
//       } else {
//         sendWordToPanel(selectedText);
//       }
//     }
//   });
// }

// function sendWordToPanel(word) {
//   const iframe = document.getElementById("sidekick-panel");
//   if (iframe) {
//     iframe.contentWindow.postMessage({ type: "word", word }, "*");
//   }
// }

// --- config ---
const blockedSites = ["mail.google.com", "docs.google.com"];
const PANEL_W = 320;
const PANEL_H = 280; // includes 20px handle + 260px iframe

// --- guard for blocked sites ---
if (!blockedSites.some(site => window.location.href.includes(site))) {
  try {
    createSidekickButton();
    handleTextSelection();
  } catch (error) {
    console.warn("Sidekick extension failed on this page:", error);
  }
}

function createSidekickButton() {
  const button = document.createElement("img");
  button.src = chrome.runtime.getURL("icons/icon32.png");
  button.id = "sidekick-icon-button";
  button.title = "Open Sidekick";

  Object.assign(button.style, {
    position: "fixed",
    top: "50%",
    left: "0",
    width: "32px",
    height: "32px",
    cursor: "pointer",
    zIndex: "2147483646", // keep below panel wrapper if overlapping
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: "8px",
    padding: "4px",
    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
  });

  // Drag (safe pattern: listeners + threshold)
  let dragging = false;
  let startX = 0, startY = 0, lastX = 0, lastY = 0;
  let startLeft = 0, startTop = 0;
  const DRAG_THRESHOLD = 3; // px

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    startX = lastX = e.clientX;
    startY = lastY = e.clientY;
    startLeft = button.offsetLeft;
    startTop = button.offsetTop;

    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp, { passive: true, once: true });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    button.style.left = (button.offsetLeft + dx) + "px";
    button.style.top  = (button.offsetTop + dy) + "px";
  };

  const onMouseUp = (e) => {
    const moved = Math.hypot(e.clientX - startX, e.clientY - startY);
    dragging = false;
    window.removeEventListener("mousemove", onMouseMove);
    // Treat as click only if not really dragged
    if (moved <= DRAG_THRESHOLD) togglePanel(button);
  };

  button.addEventListener("mousedown", onMouseDown, { passive: false });
  document.body.appendChild(button);
}

function togglePanel(iconButton) {
  let wrapper = document.getElementById("sidekick-panel-wrapper");
  if (wrapper) {
    wrapper.remove();
    return;
  }

  const iconRect = iconButton.getBoundingClientRect();
  const isOnRightSide = iconRect.left > window.innerWidth / 2;

  wrapper = document.createElement("div");
  wrapper.id = "sidekick-panel-wrapper";
  Object.assign(wrapper.style, {
    position: "fixed",
    top: `${Math.min(Math.max(0, iconRect.top), window.innerHeight - PANEL_H)}px`,
    left: isOnRightSide
      ? `${Math.max(0, iconRect.left - (PANEL_W + 10))}px`
      : `${Math.min(window.innerWidth - PANEL_W, iconRect.right + 10)}px`,
    zIndex: "2147483647",
    pointerEvents: "none" // critical: wrapper never blocks page
  });

  // Drag handle
  const handle = document.createElement("div");
  handle.id = "sidekick-drag-handle";
  Object.assign(handle.style, {
    width: `${PANEL_W}px`,
    height: "20px",
    borderRadius: "16px 16px 0 0",
    cursor: "move",
    pointerEvents: "auto", // only handle is interactive
    background: "rgba(0,0,0,0.1)",
    backdropFilter: "blur(3px)"
  });
  handle.title = "Drag";

  // Iframe
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("panel.html");
  iframe.id = "sidekick-panel";
  Object.assign(iframe.style, {
    width: `${PANEL_W}px`,
    height: `${PANEL_H - 20}px`,
    border: "none",
    borderRadius: "0 0 16px 16px",
    display: "block",
    pointerEvents: "auto" // iframe stays fully interactive
  });

  wrapper.appendChild(handle);
  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  makeDraggable(wrapper, handle);
}

function makeDraggable(container, handle) {
  let dragging = false;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startLeft = parseInt(container.style.left, 10) || 0;
    startTop  = parseInt(container.style.top, 10) || 0;

    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp, { passive: true, once: true });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    e.preventDefault(); // only during drag, prevents text selection
    let newLeft = startLeft + (e.clientX - startX);
    let newTop  = startTop  + (e.clientY - startY);

    // Keep inside viewport
    newLeft = Math.max(0, Math.min(window.innerWidth  - PANEL_W, newLeft));
    newTop  = Math.max(0, Math.min(window.innerHeight - PANEL_H, newTop));

    container.style.left = `${newLeft}px`;
    container.style.top  = `${newTop}px`;
  };

  const onMouseUp = () => {
    dragging = false;
    window.removeEventListener("mousemove", onMouseMove);
  };

  handle.addEventListener("mousedown", onMouseDown, { passive: false });
}

// Debounced text selection → send to panel
function handleTextSelection() {
  let selTimer;
  document.addEventListener("mouseup", () => {
    clearTimeout(selTimer);
    selTimer = setTimeout(() => {
      const selectedText = (window.getSelection()?.toString() || "").trim();
      if (!selectedText) return;
      if (!document.getElementById("sidekick-panel")) {
        document.getElementById("sidekick-icon-button")?.click();
        setTimeout(() => sendWordToPanel(selectedText), 300);
      } else {
        sendWordToPanel(selectedText);
      }
    }, 120);
  }, { passive: true });
}

function sendWordToPanel(word) {
  const iframe = document.getElementById("sidekick-panel");
  if (iframe && iframe.contentWindow) {
    // If you ever add a listener on the page side, restrict targetOrigin instead of "*"
    iframe.contentWindow.postMessage({ type: "word", word }, "*");
  }
}
