// Function to detect and extract terms/privacy policy text
function detectAndExtractPolicyText() {
  // Common patterns for terms and privacy policy links
  const patterns = [
    /terms\s*(of\s*)?(service|use)/i,
    /privacy\s*policy/i,
    /cookie\s*policy/i,
    /terms\s*(&|and)\s*conditions/i,
    /legal/i,
    /agreement/i,
  ];

  // Find all links and buttons
  const elements = document.querySelectorAll("a, button");

  elements.forEach((element) => {
    const text = element.textContent.toLowerCase();
    const hasMatch = patterns.some((pattern) => pattern.test(text));

    if (hasMatch) {
      // Add click listener
      element.addEventListener("click", async (e) => {
        // Check if user wants to analyze
        if (e.ctrlKey || e.metaKey) {
          // Ctrl+Click or Cmd+Click
          e.preventDefault();
          e.stopPropagation();

          // Try to get the document text
          const href = element.href || element.getAttribute("data-href");
          if (href) {
            // Fetch and analyze the document
            try {
              const response = await fetch(href);
              const html = await response.text();
              const parser = new DOMParser();
              const doc = parser.parseFromString(html, "text/html");
              const textContent = doc.body.innerText;

              // Send to background script
              chrome.runtime.sendMessage({
                action: "analyzeText",
                text: textContent,
                type: text.includes("privacy")
                  ? "privacy_policy"
                  : "terms_of_service",
              });
            } catch (error) {
              console.error("Error fetching document:", error);
            }
          }
        }
      });

      // Add visual indicator
      element.style.cursor = "help";
      element.title = "Ctrl+Click to analyze with Document Analyzer";
    }
  });
}

// Run detection when page loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", detectAndExtractPolicyText);
} else {
  detectAndExtractPolicyText();
}

// Also run on dynamic content changes
const observer = new MutationObserver(() => {
  detectAndExtractPolicyText();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
