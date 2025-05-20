// // Dark Mode
// const toggle = document.getElementById("dark-toggle");
// toggle.addEventListener("change", () => {
//   document.body.classList.toggle("dark", toggle.checked);
//   document.body.classList.toggle("light", !toggle.checked);
// });

// // Tab switch
// document.getElementById("tab-dict").addEventListener("click", () => {
//   document.getElementById("dictionary").classList.add("active");
//   document.getElementById("notes").classList.remove("active");
// });

// document.getElementById("tab-notes").addEventListener("click", () => {
//   document.getElementById("notes").classList.add("active");
//   document.getElementById("dictionary").classList.remove("active");
// });

// // Listen for selected word from content.js
// chrome.runtime.onMessage.addListener((message) => {
//   if (message.type === "word") {
//     const word = message.word;
//     const msg = document.getElementById("dict-message");
//     msg.innerHTML = `Looking up <strong>${word}</strong>...`;

//     fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (Array.isArray(data)) {
//           const definitions = data[0].meanings.map(m => `(${m.partOfSpeech}) ${m.definitions[0].definition}`).join("<br>");
//           msg.innerHTML = `<strong>${word}:</strong><br>${definitions}`;
//         } else {
//           msg.innerHTML = `No definition found for <strong>${word}</strong>.`;
//         }
//       })
//       .catch(() => {
//         msg.innerHTML = `Error fetching definition for <strong>${word}</strong>.`;
//       });
//   }
// });

// Dark Mode
const toggle = document.getElementById("dark-toggle");
toggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", toggle.checked);
  document.body.classList.toggle("light", !toggle.checked);
});

// Tabs
document.getElementById("tab-dict").addEventListener("click", () => {
  document.getElementById("dictionary").classList.add("active");
  document.getElementById("notes").classList.remove("active");
});

document.getElementById("tab-notes").addEventListener("click", () => {
  document.getElementById("notes").classList.add("active");
  document.getElementById("dictionary").classList.remove("active");
});

// Dictionary receive from content.js
window.addEventListener("message", (event) => {
  if (event.data.type === "word") {
    const word = event.data.word;
    const msg = document.getElementById("dict-message");
    msg.innerHTML = `Looking up <strong>${word}</strong>...`;

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const definitions = data[0].meanings.map(m => `(${m.partOfSpeech}) ${m.definitions[0].definition}`).join("<br>");
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
