/**
 * Billy Blocksi Enterprise Logic - Final Force Version
 */

const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

// 1. Initialization - Nuke cache on start to ensure a clean state
chrome.runtime.onInstalled.addListener(() => {
    console.log("Billy Blocksi: System Initialized. Force-clearing service worker cache...");
    chrome.browsingData.remove({ "since": 0 }, { "serviceWorkers": true, "cache": true });
});

/**
 * Core Function: NUKE_SITE
 * This is the primary blocking engine for teachers.
 */
async function nukeSite(domain) {
    const ruleId = Math.floor(Math.random() * 1000000) + 1;

    try {
        // A. Add to Chrome's high-speed Declarative engine
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": ruleId,
                "priority": 100, // Max priority to override everything else
                "action": { 
                    "type": "redirect", 
                    "redirect": { "url": BLOCKED_PAGE } 
                },
                "condition": { 
                    "urlFilter": `||${domain}^`, 
                    "resourceTypes": ["main_frame", "sub_frame", "script"] 
                }
            }]
        });

        // B. Wipe Cache/Service Workers specifically for this domain
        // This stops Cloudflare Pages/BillyBong50 from bypassing the block.
        chrome.browsingData.remove({
            "origins": [`https://${domain}`, `http://${domain}`]
        }, { "cache": true, "serviceWorkers": true });

        // C. Send Notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png",
            title: "Billy Blocksi",
            message: `Access to ${domain} has been restricted by your teacher.`
        });

        console.log(`Billy: ${domain} nuked (ID: ${ruleId})`);
    } catch (e) {
        console.error("Block failed:", e);
    }
}

// 2. Command Listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "REMOTE_BLOCK") {
        nukeSite(request.domain);
        sendResponse({ success: true });
    }
    return true; 
});
