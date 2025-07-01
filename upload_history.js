// Enforce upload_history.html can only be opened via popup
chrome.storage.local.get('allowHistory', (res) => {
    if (res.allowHistory) {
        // Opened via allowed button, reset for next time
        chrome.storage.local.set({ allowHistory: false });
    } else {
        // Opened manually, via Ctrl+Shift+T, or reloaded: close immediately
        window.close();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.querySelector('#historyTable tbody');

    // Populate upload history table
    chrome.storage.local.get('uploadHistory', (data) => {
        const history = data.uploadHistory || [];

        history.forEach((item, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.website || '-'}</td>
                <td>${item.fileName || '-'}</td>
                <td>${item.sizeKb || '-'}</td>
                <td>${item.date || '-'}</td>
                <td>${item.time || '-'}</td>
                <td style="color: ${item.uploadStatus === 'Passed' ? 'green' : 'red'}; font-weight: bold;">
                    ${item.uploadStatus || '-'}
                </td>
                <td>${item.attemptNumber || '-'}</td>
                <td>${item.totalAttempt || '-'}</td>
            `;

            tableBody.appendChild(row);
        });

        if (history.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="9" style="text-align: center; color: gray;">No upload history available</td>`;
            tableBody.appendChild(row);
        }
    });

    // Logout button handling to close all upload_history.html tabs
    // Send message to background to close all upload_history.html tabs
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            chrome.runtime.sendMessage({ action: "close-upload-history" });
        };
    }
});
