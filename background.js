chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openRedirect") {
    chrome.tabs.create({
      url: chrome.runtime.getURL("redirect.html")
    });
  }
});
