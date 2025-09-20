document.getElementById("openSidePanel").addEventListener("click", () => {
  // Open side panel
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT });
  window.close();
});
