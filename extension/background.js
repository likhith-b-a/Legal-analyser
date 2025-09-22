// background.js

const API_BASE_URL = "https://plain-law.onrender.com";

// Helper function to convert base64 to blob
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64.split(",")[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

// Function to send message to the active side panel
async function sendMessageToSidePanel(tabId, message) {
  try {
    await chrome.runtime.sendMessage(message);
  } catch (error) {
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

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle existing analyzeText action
  if (request.action === "analyzeText") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendMessageToSidePanel(tabs[0].id, {
          action: "textToAnalyze",
          text: request.text,
          type: request.type,
          url: sender.tab.url,
        });
      }
    });
    return true;
  }

  // Handle API requests from the side panel
  if (request.action.startsWith("api_")) {
    handleAPIRequest(request, sendResponse);
    return true; // Keep message channel open for async response
  }
});

// Handle API requests
async function handleAPIRequest(request, sendResponse) {
  try {
    let response;
    const formData = new FormData();

    switch (request.action) {
      case "api_qa":
        // Convert base64 back to file
        const qaBlob = base64ToBlob(request.fileData, request.fileType);
        formData.append("file", qaBlob, request.fileName);
        formData.append("query", request.query);

        response = await fetch(`${API_BASE_URL}/qa`, {
          method: "POST",
          body: formData,
        });
        break;

      case "api_summarize":
        const summarizeBlob = base64ToBlob(request.fileData, request.fileType);
        formData.append("file", summarizeBlob, request.fileName);

        response = await fetch(`${API_BASE_URL}/summarize`, {
          method: "POST",
          body: formData,
        });
        break;

      case "api_risk":
        const riskBlob = base64ToBlob(request.fileData, request.fileType);
        formData.append("file", riskBlob, request.fileName);

        response = await fetch(`${API_BASE_URL}/risk`, {
          method: "POST",
          body: formData,
        });
        break;

      case "api_chat":
        formData.append("session_id", request.sessionId);
        formData.append("message", request.message);

        if (request.fileData) {
          const chatBlob = base64ToBlob(request.fileData, request.fileType);
          formData.append("file", chatBlob, request.fileName);
        }

        response = await fetch(`${API_BASE_URL}/chat`, {
          method: "POST",
          body: formData,
        });
        break;

      default:
        throw new Error("Unknown API action");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    sendResponse({ success: true, data });
  } catch (error) {
    console.error("API request failed:", error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});
