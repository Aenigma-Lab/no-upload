// wil colose all tab when click logout button 
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "close-upload-history") {
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url && tab.url.includes("upload_history.html")) {
                    // Navigate to about:blank first
                    chrome.tabs.update(tab.id, { url: "about:blank" }, () => {
                        // Then close after a short delay to ensure navigation
                        setTimeout(() => {
                            chrome.tabs.remove(tab.id);
                        }, 300);
                    });
                }
            });
        });
    }
});
