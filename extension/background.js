// Function to send message to the active side panel
async function sendMessageToSidePanel(tabId, message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
    // This catches errors if the side panel is not open or not listening
    console.warn(
      "Could not send message to side panel (it might not be open or active):",
      error
    );
  }
}

// Allow users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script (initial text to analyze)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeText") {
    // Forward the text to the side panel (which is a React app now)
    // We need to ensure the side panel is associated with the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // The side panel will pick this up via chrome.runtime.onMessage
        sendMessageToSidePanel(tabs[0].id, {
          action: "textToAnalyze",
          text: request.text,
          type: request.type,
          url: sender.tab.url,
        });
      }
    });
    return true; // Keep message channel open for async response if needed
  } else if (request.action === "performAnalysisOnText") {
    // This message comes FROM the React side panel, requesting actual backend analysis
    const { text, type, url } = request;

    // *** IMPORTANT: Replace with your actual FastAPI endpoint ***
    const FASTAPI_ENDPOINT = "https://plain-law.onrender.com"; // Assuming FastAPI runs on 8000

    fetch(FASTAPI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        document_text: text,
        document_type: type,
        document_url: url,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Send the result back to the side panel
        sendMessageToSidePanel(null, {
          // null for tabId since message goes to the extension runtime
          action: "analysisResult",
          success: true,
          data: data,
        });
      })
      .catch((error) => {
        console.error("FastAPI analysis failed:", error);
        // Send error back to the side panel
        sendMessageToSidePanel(null, {
          action: "analysisResult",
          success: false,
          error: error.message,
        });
      });
    return true; // Keep message channel open for async response
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
