/**
 * Upload Shield - popup.js
 * Handles setup, login, recovery, whitelist, and DNR sync.
 */

// Simple demo hash: base64 — for real use, swap with a secure hash!
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

// Load whitelist and render list with ❌ buttons
function loadWhitelist() {
  chrome.storage.local.get("whitelist", (data) => {
    const list = data.whitelist || [];
    const ul = document.getElementById("whitelist");
    ul.innerHTML = "";
    list.forEach((site, index) => {
      const li = document.createElement("li");
      li.textContent = site;
      const btn = document.createElement("button");
      btn.textContent = "❌";
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

// Update declarativeNetRequest dynamic rules
function updateDNRRules(whitelist) {
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
    removeRuleIds: [1001]
  }, () => {
    console.log("[Upload Shield] ✅ DNR allow rules updated:", whitelist);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const setupSection = document.getElementById('setup-section');
  const loginSection = document.getElementById('login-section');
  const forgotSection = document.getElementById('forgot-section');
  const settingsSection = document.getElementById('settings-section');

  // On load: check password existence
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
      } else {
        document.getElementById('password-status').textContent = "Incorrect current password.";
      }
    });
  };

  // 5️⃣ Save security question
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
  };

  // 6️⃣ Add site to whitelist + update DNR
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

  // 7️⃣ Clear all domains + update DNR
  document.getElementById('clear-all').onclick = () => {
    chrome.storage.local.set({ whitelist: [] }, () => {
      updateDNRRules([]);
      loadWhitelist();
    });
  };
});
