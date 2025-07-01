// function showOverlayMessage() {
//   // Inject styles
//   const style = document.createElement('style');
//   style.textContent = `
//     .file-blocker-overlay {
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100vw;
//       height: 100vh;
//       background-color: #fff0f0;
//       z-index: 999999;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//       font-family: Arial, sans-serif;
//     }

//     .file-blocker-overlay h1 {
//       font-size: 48px;
//       color: red;
//       animation: blink 1s infinite;
//       margin-bottom: 10px;
//     }

//     .file-blocker-overlay p {
//       font-size: 18px;
//       color: #333;
//     }

//     .file-blocker-close {
//       margin-top: 30px;
//       padding: 10px 20px;
//       font-size: 16px;
//       background: red;
//       color: white;
//       border: none;
//       cursor: pointer;
//       border-radius: 5px;
//     }

//     @keyframes blink {
//       0% { opacity: 1; }
//       50% { opacity: 0; }
//       100% { opacity: 1; }
//     }
//   `;
//   document.head.appendChild(style);

//   // Clear the page and inject overlay
//   const overlay = document.createElement("div");
//   overlay.className = "file-blocker-overlay";
//   overlay.innerHTML = `
//     <h1>⚠️ File Upload Blocked</h1>
//     <p>File upload is blocked by the administrator on this site.</p>
//     <button class="file-blocker-close">Close</button>
//   `;

//   // Replace page with overlay
//   document.body.innerHTML = "";
//   document.body.appendChild(overlay);

//   // Optional: add close button handler
//   overlay.querySelector(".file-blocker-close").addEventListener("click", () => {
//     overlay.remove();
//     window.location.reload(); // optional: refresh page after closing overlay
//   });
// }

// chrome.storage.local.get(["whitelist"], function (data) {
//   const whitelist = data.whitelist || [];
//   const hostname = window.location.hostname;

//   const isWhitelisted = whitelist.some((domain) =>
//     hostname === domain || hostname.endsWith(`.${domain}`)
//   );

//   if (!isWhitelisted) {
//     document.addEventListener("submit", function (e) {
//       if (e.target.querySelector('input[type="file"]')) {
//         e.preventDefault();
//         showOverlayMessage();
//       }
//     }, true);

//     document.addEventListener("change", function (e) {
//       if (e.target.type === "file") {
//         e.target.value = "";
//         showOverlayMessage();
//       }
//     }, true);
//   }
// });








// function showOverlayMessage() {
//   // Prevent multiple overlays
//   if (document.querySelector('.file-blocker-overlay')) return;

//   const style = document.createElement('style');
//   style.textContent = `
//     .file-blocker-overlay {
//       position: fixed;
//       top: 0; left: 0;
//       width: 100vw; height: 100vh;
//       background-color: #fff0f0;
//       z-index: 999999;
//       display: flex;
//       flex-direction: column;
//       justify-content: center;
//       align-items: center;
//       font-family: Arial, sans-serif;
//     }
//     .file-blocker-overlay h1 {
//       font-size: 48px;
//       color: red;
//       animation: blink 1s infinite;
//       margin-bottom: 10px;
//     }
//     .file-blocker-overlay p {
//       font-size: 18px;
//       color: #333;
//     }
//     .file-blocker-close {
//       margin-top: 30px;
//       padding: 10px 20px;
//       font-size: 16px;
//       background: red;
//       color: white;
//       border: none;
//       cursor: pointer;
//       border-radius: 5px;
//     }
//     @keyframes blink {
//       0% { opacity: 1; }
//       50% { opacity: 0; }
//       100% { opacity: 1; }
//     }
//   `;
//   document.head.appendChild(style);

//   const overlay = document.createElement('div');
//   overlay.className = 'file-blocker-overlay';
//   overlay.innerHTML = `
//     <h1>⚠️ File Upload Blocked</h1>
//     <p>Uploads are blocked by your administrator on this site.</p>
//     <button class="file-blocker-close">Close</button>
//   `;
//   document.body.appendChild(overlay);

//   overlay.querySelector('.file-blocker-close').onclick = () => {
//     overlay.remove();
//   };
// }

// document.addEventListener('DOMContentLoaded', () => {
//   chrome.storage.local.get(['whitelist'], (data) => {
//     const whitelist = data.whitelist || [];
//     const hostname = window.location.hostname;

//     const isWhitelisted = whitelist.some((domain) =>
//       hostname === domain || hostname.endsWith(`.${domain}`)
//     );

//     if (isWhitelisted) {
//       console.log(`[Upload Shield] ✅ Allowed domain: ${hostname}`);
//       return;
//     }

//     console.log(`[Upload Shield] ❌ Blocking uploads on: ${hostname}`);

//     // 1️⃣ Block file input changes
//     document.addEventListener('change', (e) => {
//       if (e.target && e.target.type === 'file') {
//         e.preventDefault();
//         e.target.value = '';
//         showOverlayMessage();
//       }
//     }, true);

//     // 2️⃣ Block form submits with file inputs
//     document.addEventListener('submit', (e) => {
//       if (e.target && e.target.querySelector('input[type="file"]')) {
//         e.preventDefault();
//         showOverlayMessage();
//       }
//     }, true);

//     // 3️⃣ Block drag & drop
//     window.addEventListener('dragover', (e) => e.preventDefault(), false);
//     window.addEventListener('drop', (e) => {
//       e.preventDefault();
//       showOverlayMessage();
//     }, false);

//     // 4️⃣ Disable file inputs on load
//     function disableFileInputs() {
//       document.querySelectorAll('input[type="file"]').forEach((input) => {
//         input.disabled = true;
//         input.style.pointerEvents = 'none';
//         input.title = 'Uploads are blocked by Upload Shield';
//       });
//     }
//     disableFileInputs();

//     // 5️⃣ Observe new file inputs dynamically
//     const observer = new MutationObserver(disableFileInputs);
//     observer.observe(document.body, { childList: true, subtree: true });

//     // 6️⃣ Patch XHR.send to block FormData
//     const originalSend = XMLHttpRequest.prototype.send;
//     XMLHttpRequest.prototype.send = function (body) {
//       if (body instanceof FormData) {
//         console.log('[Upload Shield] ❌ XHR file upload blocked.');
//         showOverlayMessage();
//         return; // Block
//       }
//       return originalSend.apply(this, arguments);
//     };

//     // 7️⃣ Patch fetch to block FormData
//     const originalFetch = window.fetch;
//     window.fetch = function (resource, init) {
//       if (init && init.body instanceof FormData) {
//         console.log('[Upload Shield] ❌ fetch() file upload blocked.');
//         showOverlayMessage();
//         return Promise.reject(new Error('Uploads blocked by Upload Shield.'));
//       }
//       return originalFetch.apply(this, arguments);
//     };
//   });
// });


/**
 * Upload Shield - Full content.js
 * Blocks ALL uploads except on whitelisted domains.
 */


console.log('[Upload Shield] ✅ Content script loaded!');

function showOverlayMessage() {
  if (document.querySelector('.file-blocker-overlay')) return;

  const style = document.createElement('style');
  style.textContent = `
    .file-blocker-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background-color: #fff0f0; z-index: 999999;
      display: flex; flex-direction: column; justify-content: center; align-items: center;
      font-family: Arial, sans-serif;
    }
    .file-blocker-overlay h1 {
      font-size: 48px; color: red; animation: blink 1s infinite; margin-bottom: 10px;
    }
    .file-blocker-overlay p {
      font-size: 18px; color: #333;
    }
    .file-blocker-close {
      margin-top: 30px; padding: 10px 20px; font-size: 16px;
      background: red; color: white; border: none; cursor: pointer; border-radius: 5px;
    }
    @keyframes blink {
      0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'file-blocker-overlay';
  overlay.innerHTML = `
    <h1>⚠️ File Upload Blocked</h1>
    <p>Uploads are blocked by your administrator on this site.</p>
    <button class="file-blocker-close">Close</button>
  `;
  document.body.innerHTML = "";
  document.body.appendChild(overlay);

  overlay.querySelector('.file-blocker-close').onclick = () => {
    overlay.remove();
    window.location.reload();
  };
}

chrome.storage.local.get(['whitelist'], (data) => {
  const whitelist = data.whitelist || [];
  const hostname = window.location.hostname;

  const isWhitelisted = whitelist.length > 0 && whitelist.some(domain =>
    hostname === domain || hostname.endsWith(`.${domain}`)
  );

  console.log('[Upload Shield] Whitelist:', whitelist);
  console.log('[Upload Shield] Hostname:', hostname);
  console.log('[Upload Shield] Allowed?', isWhitelisted);

  if (!isWhitelisted) {
    function disableFileInputs() {
      document.querySelectorAll('input[type="file"]').forEach(input => {
        input.disabled = true;
        input.style.pointerEvents = 'none';
        input.title = 'Uploads blocked by Upload Shield';

        input.addEventListener("click", (e) => {
          e.preventDefault();
          showOverlayMessage();
        }, true);

        input.addEventListener("change", (e) => {
          e.preventDefault();
          e.target.value = "";
          showOverlayMessage();
        }, true);
      });
    }
    disableFileInputs();
    new MutationObserver(disableFileInputs).observe(document.body, { childList: true, subtree: true });

    document.addEventListener("submit", (e) => {
      if (e.target?.querySelector('input[type="file"]')) {
        e.preventDefault();
        showOverlayMessage();
      }
    }, true);

    window.addEventListener("dragover", (e) => {
      if (e.dataTransfer?.types.includes("Files")) {
        e.preventDefault();
      }
    }, true);

    window.addEventListener("drop", (e) => {
      if (e.dataTransfer?.files?.length > 0) {
        e.preventDefault();
        showOverlayMessage();
      }
    }, true);

    window.addEventListener("paste", (e) => {
      if ([...e.clipboardData.items].some(i => i.kind === "file")) {
        e.preventDefault();
        showOverlayMessage();
      }
    }, true);

    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
      if (init?.body instanceof FormData) {
        for (const value of init.body.values()) {
          if (value instanceof File || value instanceof Blob) {
            console.log("[Upload Shield] Blocked fetch upload.");
            showOverlayMessage();
            return Promise.reject(new Error("Uploads blocked by Upload Shield."));
          }
        }
      }
      return originalFetch.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (body) {
      if (body instanceof FormData) {
        for (const value of body.values()) {
          if (value instanceof File || value instanceof Blob) {
            console.log("[Upload Shield] Blocked XHR upload.");
            showOverlayMessage();
            return;
          }
        }
      }
      return originalSend.apply(this, arguments);
    };
  } else {
    console.log("[Upload Shield] ✅ Uploads allowed on this domain.");
  }
});
