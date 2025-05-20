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

//   // Create draggable wrapper
//   wrapper = document.createElement("div");
//   wrapper.id = "sidekick-panel-wrapper";
//   wrapper.style.position = "fixed";
//   wrapper.style.top = `${iconRect.top}px`;
//   wrapper.style.left = isOnRightSide
//     ? `${iconRect.left - 330}px`  // open to left of icon
//     : `${iconRect.right + 10}px`; // open to right of icon

//   wrapper.style.zIndex = "999999";
//   wrapper.style.cursor = "move";

//   // Create iframe inside wrapper
//   const iframe = document.createElement("iframe");
//   iframe.src = chrome.runtime.getURL("panel.html");
//   iframe.id = "sidekick-panel";
//   iframe.style.width = "320px";
//   iframe.style.height = "280px";
//   iframe.style.border = "none";
//   iframe.style.borderRadius = "16px";
//   iframe.style.display = "block";

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
//       // Show panel if not shown
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

// createSidekickButton();
// handleTextSelection();


const blockedSites = ["mail.google.com", "docs.google.com"];

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

  button.style.position = "fixed";
  button.style.top = "50%";
  button.style.left = "0";
  button.style.width = "32px";
  button.style.height = "32px";
  button.style.cursor = "pointer";
  button.style.zIndex = "999999";
  button.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
  button.style.borderRadius = "8px";
  button.style.padding = "4px";
  button.style.boxShadow = "0 0 4px rgba(0,0,0,0.3)";

  // Drag icon
  let isDragging = false;
  let offsetX, offsetY;

  button.onmousedown = (e) => {
    isDragging = true;
    offsetX = e.clientX;
    offsetY = e.clientY;

    document.onmousemove = (ev) => {
      if (!isDragging) return;
      const dx = ev.clientX - offsetX;
      const dy = ev.clientY - offsetY;
      button.style.left = button.offsetLeft + dx + "px";
      button.style.top = button.offsetTop + dy + "px";
      offsetX = ev.clientX;
      offsetY = ev.clientY;
    };

    document.onmouseup = () => {
      isDragging = false;
      document.onmousemove = null;
    };
  };

  button.addEventListener("click", () => togglePanel(button));
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
  wrapper.style.position = "fixed";
  wrapper.style.top = `${iconRect.top}px`;
  wrapper.style.left = isOnRightSide
    ? `${iconRect.left - 330}px`
    : `${iconRect.right + 10}px`;
  wrapper.style.zIndex = "999999";
  wrapper.style.cursor = "move";
  wrapper.style.pointerEvents = "auto"; // allow interaction

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("panel.html");
  iframe.id = "sidekick-panel";
  iframe.style.width = "320px";
  iframe.style.height = "280px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "16px";
  iframe.style.display = "block";
  iframe.style.pointerEvents = "auto"; // needed for iframe interaction

  wrapper.appendChild(iframe);
  document.body.appendChild(wrapper);

  makeDraggable(wrapper);
}

function makeDraggable(elmnt) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;

    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Handle text selection
function handleTextSelection() {
  document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText.length > 0) {
      if (!document.getElementById("sidekick-panel")) {
        document.getElementById("sidekick-icon-button").click();
        setTimeout(() => sendWordToPanel(selectedText), 400);
      } else {
        sendWordToPanel(selectedText);
      }
    }
  });
}

function sendWordToPanel(word) {
  const iframe = document.getElementById("sidekick-panel");
  if (iframe) {
    iframe.contentWindow.postMessage({ type: "word", word }, "*");
  }
}
