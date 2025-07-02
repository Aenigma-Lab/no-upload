/**
 * Upload Shield - popup.js (Extended)
 * Handles setup, login, recovery, whitelist, upload history view,
 * and in-popup update password & security toggle.
 */

// Simple demo hash: base64 — replace with a secure hash in production
function hash(input) {
  return btoa(input);
}

// Normalize domain input
function normalizeDomain(input) {
  try {
    const url = new URL(input.includes("://") ? input : "https://" + input);
    return url.hostname.replace(/^www\./, "");
  } catch {
    alert("Invalid domain");
    return null;
  }
}

// Load whitelist and render
// function loadWhitelist() {
//   chrome.storage.local.get("whitelist", (data) => {
//     const list = data.whitelist || [];
//     const ul = document.getElementById("whitelist");
//     ul.innerHTML = "";
//     list.forEach((site, index) => {
//       const li = document.createElement("li");
//       li.textContent = site;
//       const btn = document.createElement("button");
//       btn.textContent = "❌";
//       btn.onclick = () => {
//         list.splice(index, 1);
//         chrome.storage.local.set({ whitelist: list }, () => {
//           updateDNRRules(list);
//           loadWhitelist();
//         });
//       };
//       li.appendChild(btn);
//       ul.appendChild(li);
//     });
//   });
// }
function loadWhitelist() {
  chrome.storage.local.get("whitelist", (data) => {
    const list = data.whitelist || [];
    const ul = document.getElementById("whitelist");
    ul.innerHTML = "";
    list.forEach((site, index) => {
      const li = document.createElement("li");
      li.textContent = site;

      const btn = document.createElement("button");
      btn.textContent = "🗑️";

      // ✅ Added requested CSS:
      btn.style.background = "none";
      btn.style.border = "none";
      btn.style.color = "#ff4d4d";
      btn.style.cursor = "pointer";
      btn.style.fontSize = "16px";
      btn.style.marginLeft = "8px";
      btn.onmouseenter = () => btn.style.color = "#ff0000";
      btn.onmouseleave = () => btn.style.color = "#ff4d4d";

      btn.onclick = () => {
        list.splice(index, 1);
        chrome.storage.local.set({ whitelist: list }, () => {
          updateDNRRules(list);
          loadWhitelist();
        });
      };

      li.appendChild(btn);
      ul.appendChild(li);
    });
  });
}


// Update declarativeNetRequest rules
function updateDNRRules(whitelist) {
    const blockAllRule = {
        id: 2001,
        priority: 1,
        action: { type: "block" },
        condition: {
            resourceTypes: ["xmlhttprequest"]
        }
    };

    chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [blockAllRule],
        removeRuleIds: [1001, 2001] // remove any existing first to avoid duplicates
    }, () => {
        if (whitelist.length > 0) {
            const allowRule = {
                id: 1001,
                priority: 2,
                action: { type: "allow" },
                condition: {
                    domains: whitelist,
                    resourceTypes: ["xmlhttprequest"]
                }
            };
            chrome.declarativeNetRequest.updateDynamicRules({
                addRules: [allowRule],
                removeRuleIds: [1001] // cleanup redundant if needed
            }, () => {
                console.log("[Upload Shield] ✅ DNR rules updated for whitelist:", whitelist);
            });
        } else {
            console.log("[Upload Shield] ✅ All uploads are now blocked (no whitelist).");
        }
    });
}

// -------------------- Custom URL Management ------------------------

function loadCustomURLs() {
    chrome.storage.local.get({ customURLs: [] }, (data) => {
        const list = document.getElementById('custom-url-list');
        list.innerHTML = '';

        if (!data.customURLs || data.customURLs.length === 0) {
            const li = document.createElement('li');
            li.textContent = "No URLs added yet.";
            li.style.color = "#888";
            list.appendChild(li);
            return;
        }

        const url = data.customURLs[0]; // Only one allowed
        const li = document.createElement('li');
        li.textContent = url;

        const removeBtn = document.createElement('button');
        removeBtn.textContent = "🗑️";
        removeBtn.style.background = "none";
        removeBtn.style.border = "none";
        removeBtn.style.color = "#ff4d4d";
        removeBtn.style.cursor = "pointer";
        removeBtn.style.fontSize = "16px";
        removeBtn.style.marginLeft = "8px";
        removeBtn.onmouseenter = () => removeBtn.style.color = "#ff0000";
        removeBtn.onmouseleave = () => removeBtn.style.color = "#ff4d4d";

        removeBtn.onclick = () => {
            chrome.storage.local.set({ customURLs: [] }, () => {
                loadCustomURLs();
            });
        };

        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

document.getElementById('add-custom-url').addEventListener('click', () => {
    const urlInput = document.getElementById('custom-url-input');
    const url = urlInput.value.trim();
    if (!url) return alert("Please enter a URL.");
    try {
        new URL(url);
    } catch {
        return alert("Invalid URL format.");
    }

    chrome.storage.local.get({ customURLs: [] }, (data) => {
        const updated = data.customURLs;
        updated.push(url);
        chrome.storage.local.set({ customURLs: updated }, () => {
            urlInput.value = '';
            loadCustomURLs();
        });
    });
});

// Load on popup open
document.addEventListener('DOMContentLoaded', loadCustomURLs);




document.addEventListener('DOMContentLoaded', () => {
  const setupSection = document.getElementById('setup-section');
  const loginSection = document.getElementById('login-section');
  const forgotSection = document.getElementById('forgot-section');
  const settingsSection = document.getElementById('settings-section');
  const updateSection = document.getElementById('update-section');
  const showUpdateBtn = document.getElementById('show-update-section-btn');
  const backToSettingsBtn = document.getElementById('back-to-settings');

  // Handle show update section inside popup
  if (showUpdateBtn && updateSection && settingsSection && backToSettingsBtn) {
    showUpdateBtn.addEventListener('click', () => {
      settingsSection.classList.add('hidden');
      updateSection.classList.remove('hidden');
    });
    backToSettingsBtn.addEventListener('click', () => {
      updateSection.classList.add('hidden');
      settingsSection.classList.remove('hidden');
    });
  }

  // On load: check if password is set
  chrome.storage.local.get(['password'], (res) => {
    if (!res.password) {
      setupSection.classList.remove('hidden');
    } else {
      loginSection.classList.remove('hidden');
    }
  });

  // 1️⃣ Save first-time password & security
  document.getElementById('save-setup').onclick = () => {
    const pwd = document.getElementById('setup-password').value.trim();
    const q = document.getElementById('setup-security-question').value;
    const a = document.getElementById('setup-security-answer').value.trim().toLowerCase();
    if (pwd.length < 6 || !q || !a) {
      document.getElementById('setup-status').textContent = "Fill all fields.";
      return;
    }
    chrome.storage.local.set({
      password: hash(pwd),
      securityQuestion: q,
      securityAnswer: hash(a)
    }, () => {
      setupSection.classList.add('hidden');
      loginSection.classList.remove('hidden');
    });
  };

  // 2️⃣ Login
  document.getElementById('login').onclick = () => {
    const entered = hash(document.getElementById('pwd').value.trim());
    chrome.storage.local.get('password', (res) => {
      if (entered === res.password) {
        loginSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
        loadWhitelist();
      } else {
        document.getElementById('login-status').textContent = "Wrong password.";
      }
    });
  };

  // 3️⃣ Forgot Password
  document.getElementById('forgot-password-btn').onclick = () => {
    chrome.storage.local.get('securityQuestion', (res) => {
      document.getElementById('security-question').value = res.securityQuestion || "";
    });
    loginSection.classList.add('hidden');
    forgotSection.classList.remove('hidden');
  };

  document.getElementById('recover-access').onclick = () => {
    const a = hash(document.getElementById('security-answer').value.trim().toLowerCase());
    const q = document.getElementById('security-question').value;
    chrome.storage.local.get(['securityQuestion', 'securityAnswer'], (res) => {
      if (q === res.securityQuestion && a === res.securityAnswer) {
        forgotSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
        loadWhitelist();
      } else {
        document.getElementById('recover-status').textContent = "Invalid answer.";
      }
    });
  };

  // 4️⃣ Update password
  document.getElementById('update-password').onclick = () => {
    const current = hash(document.getElementById('current-password').value.trim());
    const newPwd = document.getElementById('new-password').value.trim();
    if (newPwd.length < 6) {
      document.getElementById('password-status').textContent = "New password too short.";
      return;
    }
    chrome.storage.local.get('password', (res) => {
      if (current === res.password) {
        chrome.storage.local.set({ password: hash(newPwd) });
        document.getElementById('password-status').textContent = "Password updated!";
        // Auto-return to settings
        updateSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
      } else {
        document.getElementById('password-status').textContent = "Incorrect current password.";
      }
    });
  };

  // 5️⃣ Update security question
  document.getElementById('save-security').onclick = () => {
    const q = document.getElementById('set-security-question').value;
    const a = document.getElementById('set-security-answer').value.trim().toLowerCase();
    if (!q || !a) {
      document.getElementById('security-status').textContent = "Fill both fields.";
      return;
    }
    chrome.storage.local.set({
      securityQuestion: q,
      securityAnswer: hash(a)
    });
    document.getElementById('security-status').textContent = "Security question saved.";
    // Auto-return to settings
    updateSection.classList.add('hidden');
    settingsSection.classList.remove('hidden');
  };

  // 6️⃣ Add site to whitelist
  document.getElementById('add-site').onclick = () => {
    const domain = normalizeDomain(document.getElementById('site-input').value.trim());
    if (!domain) return;
    chrome.storage.local.get('whitelist', (res) => {
      const wl = res.whitelist || [];
      if (!wl.includes(domain)) {
        wl.push(domain);
        chrome.storage.local.set({ whitelist: wl }, () => {
          updateDNRRules(wl);
          loadWhitelist();
        });
      } else {
        alert("Domain already added.");
      }
    });
  };

  // 7️⃣ Clear all domains
  document.getElementById('clear-all').onclick = () => {
    chrome.storage.local.set({ whitelist: [] }, () => {
      updateDNRRules([]);
      loadWhitelist();
    });
  };

  // 8️⃣ View Upload History
    document.getElementById('view-history').onclick = () => {
      chrome.storage.local.set({ allowHistory: true }, () => {
          chrome.tabs.create({
              url: chrome.runtime.getURL('upload_history.html'),
              active: true
          });
      });
  };
});
