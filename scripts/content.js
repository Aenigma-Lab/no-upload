// Upload Shield - content.js (final clean full code)

// console.log('[Upload Shield] ✅ Content script loaded!');

// function showOverlayMessage() {
//   if (document.querySelector('.file-blocker-overlay')) return;

//   const style = document.createElement('style');
//   style.textContent = `
//     .file-blocker-overlay {
//       position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
//       background-color: #fff0f0; z-index: 999999;
//       display: flex; flex-direction: column; justify-content: center; align-items: center;
//       font-family: Arial, sans-serif;
//     }
//     .file-blocker-overlay h1 {
//       font-size: 48px; color: red; animation: blink 1s infinite; margin-bottom: 10px;
//     }
//     .file-blocker-overlay p {
//       font-size: 18px; color: #333;
//     }
//     .file-blocker-close {
//       margin-top: 30px; padding: 10px 20px; font-size: 16px;
//       background: red; color: white; border: none; cursor: pointer; border-radius: 5px;
//     }
//     @keyframes blink {
//       0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; }
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
//   document.body.innerHTML = "";
//   document.body.appendChild(overlay);

//   overlay.querySelector('.file-blocker-close').onclick = () => {
//     overlay.remove();
//     window.location.reload();
//   };
// }


// function logUploadAttempt(status, fileName, sizeKb) {
//   const now = new Date();
//   const record = {
//     website: window.location.hostname,
//     fileName: fileName || 'Unknown',
//     sizeKb: sizeKb || 0,
//     date: now.toLocaleDateString(),
//     time: now.toLocaleTimeString(),
//     uploadStatus: status // "Passed" or "Failed"
//   };

//   chrome.storage.local.get({ uploadHistory: [] }, (data) => {
//     const history = data.uploadHistory;
//     history.push(record);
//     chrome.storage.local.set({ uploadHistory: history }, () => {
//       console.log("[Upload Shield] ✅ Upload attempt logged:", record);
//     });
//   });
// }

// chrome.storage.local.get(['whitelist'], (data) => {
//   const whitelist = data.whitelist || [];
//   const hostname = window.location.hostname;

//   const isWhitelisted = whitelist.length > 0 && whitelist.some(domain =>
//     hostname === domain || hostname.endsWith(`.${domain}`)
//   );

//   console.log('[Upload Shield] Whitelist:', whitelist);
//   console.log('[Upload Shield] Hostname:', hostname);
//   console.log('[Upload Shield] Allowed?', isWhitelisted);

//   if (!isWhitelisted) {
//     function disableFileInputs() {
//       document.querySelectorAll('input[type="file"]').forEach(input => {
//         input.disabled = true;
//         input.style.pointerEvents = 'none';
//         input.title = 'Uploads blocked by Upload Shield';

//         input.addEventListener("click", (e) => {
//           e.preventDefault();
//           showOverlayMessage();
//         }, true);

//         input.addEventListener("change", (e) => {
//           e.preventDefault();
//           e.target.value = "";
//           showOverlayMessage();
//         }, true);
//       });
//     }
//     disableFileInputs();
//     new MutationObserver(disableFileInputs).observe(document.body, { childList: true, subtree: true });

//     document.addEventListener("submit", (e) => {
//       if (e.target?.querySelector('input[type="file"]')) {
//         e.preventDefault();
//         showOverlayMessage();
//       }
//     }, true);

//     window.addEventListener("dragover", (e) => {
//       if (e.dataTransfer?.types.includes("Files")) {
//         e.preventDefault();
//       }
//     }, true);

//     window.addEventListener("drop", (e) => {
//       if (e.dataTransfer?.files?.length > 0) {
//         e.preventDefault();
//         const file = e.dataTransfer.files[0];
//         const sizeKb = Math.round(file.size / 1024);
//         const fileName = file.name;
//         logUploadAttempt("Failed", fileName, sizeKb);
//         showOverlayMessage();
//       }
//     }, true);

//     window.addEventListener("paste", (e) => {
//       if ([...e.clipboardData.items].some(i => i.kind === "file")) {
//         e.preventDefault();
//         showOverlayMessage();
//       }
//     }, true);

//     const originalFetch = window.fetch;
//     window.fetch = function (resource, init) {
//       if (init?.body instanceof FormData) {
//         for (const value of init.body.values()) {
//           if (value instanceof File || value instanceof Blob) {
//             console.log("[Upload Shield] Blocked fetch upload.");
//             const sizeKb = value.size ? Math.round(value.size / 1024) : 0;
//             const fileName = value.name || 'Unknown';
//             logUploadAttempt("Failed", fileName, sizeKb);
//             showOverlayMessage();
//             return Promise.reject(new Error("Uploads blocked by Upload Shield."));
//           }
//         }
//       }
//       return originalFetch.apply(this, arguments);
//     };

//     const originalSend = XMLHttpRequest.prototype.send;
//     XMLHttpRequest.prototype.send = function (body) {
//       if (body instanceof FormData) {
//         for (const value of body.values()) {
//           if (value instanceof File || value instanceof Blob) {
//             console.log("[Upload Shield] Blocked XHR upload.");
//             const sizeKb = value.size ? Math.round(value.size / 1024) : 0;
//             const fileName = value.name || 'Unknown';
//             logUploadAttempt("Failed", fileName, sizeKb);
//             showOverlayMessage();
//             return;
//           }
//         }
//       }
//       return originalSend.apply(this, arguments);
//     };

//     // Log blocked attempts on file input
//     document.addEventListener('change', (e) => {
//       const input = e.target;
//       if (input.tagName === 'INPUT' && input.type === 'file' && input.files.length > 0) {
//         const file = input.files[0];
//         const sizeKb = Math.round(file.size / 1024);
//         const fileName = file.name;
//         logUploadAttempt("Failed", fileName, sizeKb);
//       }
//     }, true);

//   } else {
//     console.log("[Upload Shield] ✅ Uploads allowed on this domain.");

//     // Log successful upload attempts on whitelisted domains
//     document.addEventListener('change', (e) => {
//       const input = e.target;
//       if (input.tagName === 'INPUT' && input.type === 'file' && input.files.length > 0) {
//         const file = input.files[0];
//         const sizeKb = Math.round(file.size / 1024);
//         const fileName = file.name;
//         logUploadAttempt("Passed", fileName, sizeKb);
//       }
//     }, true);

//     window.addEventListener("drop", (e) => {
//       if (e.dataTransfer?.files?.length > 0) {
//         const file = e.dataTransfer.files[0];
//         const sizeKb = Math.round(file.size / 1024);
//         const fileName = file.name;
//         logUploadAttempt("Passed", fileName, sizeKb);
//       }
//     }, true);
//   }
// });

console.log('[Upload Shield] ✅ Content script loaded!');

let redirectURL = null;

// Fetch customURLs once at start
chrome.storage.local.get({ customURLs: [] }, (data) => {
    if (data.customURLs && data.customURLs.length > 0) {
        redirectURL = data.customURLs[0];
    }
    proceedUploadShield(); // call main logic after loading
});

function proceedUploadShield() {
    chrome.storage.local.get(['whitelist'], (data) => {
        const whitelist = data.whitelist || [];
        const hostname = window.location.hostname;

        const isWhitelisted = whitelist.some(domain =>
            hostname === domain || hostname.endsWith(`.${domain}`)
        );

        console.log('[Upload Shield] Whitelist:', whitelist);
        console.log('[Upload Shield] Hostname:', hostname);
        console.log('[Upload Shield] Allowed?', isWhitelisted);

        if (!isWhitelisted) {
            blockUploads();
        } else {
            console.log("[Upload Shield] ✅ Uploads allowed on this domain.");
            // Log allowed uploads
            trackUploads("Passed");
        }
    });
}

function blockUploads() {
    disableFileInputs();
    new MutationObserver(disableFileInputs).observe(document.body, { childList: true, subtree: true });

    document.addEventListener("submit", (e) => {
        if (e.target?.querySelector('input[type="file"]')) {
            e.preventDefault();
            handleBlockAction();
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
            const file = e.dataTransfer.files[0];
            logUploadAttempt("Failed", file.name, Math.round(file.size / 1024));
            handleBlockAction();
        }
    }, true);

    window.addEventListener("paste", (e) => {
        if ([...e.clipboardData.items].some(i => i.kind === "file")) {
            e.preventDefault();
            handleBlockAction();
        }
    }, true);

    const originalFetch = window.fetch;
    window.fetch = function (resource, init) {
        if (init?.body instanceof FormData) {
            for (const value of init.body.values()) {
                if (value instanceof File || value instanceof Blob) {
                    console.log("[Upload Shield] Blocked fetch upload.");
                    logUploadAttempt("Failed", value.name || 'Unknown', Math.round(value.size / 1024));
                    handleBlockAction();
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
                    logUploadAttempt("Failed", value.name || 'Unknown', Math.round(value.size / 1024));
                    handleBlockAction();
                    return;
                }
            }
        }
        return originalSend.apply(this, arguments);
    };

    document.addEventListener('change', (e) => {
        const input = e.target;
        if (input.tagName === 'INPUT' && input.type === 'file' && input.files.length > 0) {
            logUploadAttempt("Failed", input.files[0].name, Math.round(input.files[0].size / 1024));
            handleBlockAction();
        }
    }, true);
}

function disableFileInputs() {
    document.querySelectorAll('input[type="file"]').forEach(input => {
        input.disabled = true;
        input.style.pointerEvents = 'none';
        input.title = 'Uploads blocked by Upload Shield';
        input.addEventListener("click", (e) => {
            e.preventDefault();
            handleBlockAction();
        }, true);
        input.addEventListener("change", (e) => {
            e.preventDefault();
            e.target.value = "";
            handleBlockAction();
        }, true);
    });
}

function handleBlockAction() {
    if (redirectURL) {
        if (window.location.href !== redirectURL) {
            console.log("[Upload Shield] Redirecting to custom URL:", redirectURL);
            window.location.replace(redirectURL);
        }
    } else {
        showOverlayMessage();
    }
}

function trackUploads(status) {
    document.addEventListener('change', (e) => {
        const input = e.target;
        if (input.tagName === 'INPUT' && input.type === 'file' && input.files.length > 0) {
            logUploadAttempt(status, input.files[0].name, Math.round(input.files[0].size / 1024));
        }
    }, true);

    window.addEventListener("drop", (e) => {
        if (e.dataTransfer?.files?.length > 0) {
            const file = e.dataTransfer.files[0];
            logUploadAttempt(status, file.name, Math.round(file.size / 1024));
        }
    }, true);
}

function logUploadAttempt(status, fileName, sizeKb) {
    const now = new Date();
    const record = {
        website: window.location.hostname,
        fileName: fileName || 'Unknown',
        sizeKb: sizeKb || 0,
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        uploadStatus: status
    };
    chrome.storage.local.get({ uploadHistory: [] }, (data) => {
        const history = data.uploadHistory;
        history.push(record);
        chrome.storage.local.set({ uploadHistory: history }, () => {
            console.log("[Upload Shield] ✅ Upload attempt logged:", record);
        });
    });
}

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
