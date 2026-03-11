// background.js - The Billy Blocksi Brain
chrome.runtime.onInstalled.addListener(() => {
  console.log("Billy Blocksi Engine: ONLINE");
  
  // Verify rulesets are loaded correctly
  chrome.declarativeNetRequest.getEnabledRulesets((rulesetIds) => {
    console.log("Active Rulesets:", rulesetIds);
  });
});

// This is a placeholder for your Firebase logic later
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "TEST_BLOCK") {
    console.log("Teacher requested block for:", request.url);
    // Dynamic rule logic will go here
  }
});
