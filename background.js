// background.js
const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

async function nukeSite(domain) {
    // 1. Clean the domain
    const cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
    const ruleId = Math.floor(Math.random() * 900000) + 100000;

    // 2. Add the Rule (For future visits)
    await chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [{
            "id": ruleId,
            "priority": 100,
            "action": { "type": "redirect", "redirect": { "url": BLOCKED_PAGE } },
            "condition": { "urlFilter": `||${cleanDomain}^`, "resourceTypes": ["main_frame"] }
        }]
    });

    // 3. THE INSTANT KILL (For the current visit)
    // Find any tab that matches the domain and force-redirect it NOW
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
        if (tab.url && tab.url.includes(cleanDomain)) {
            chrome.tabs.update(tab.id, { url: BLOCKED_PAGE });
        }
    }

    // 4. Force-Inject a "Stop" command into all tabs (Nuclear Option)
    // This stops the page from loading even if the redirect is slow
    chrome.tabs.query({url: `*://*.${cleanDomain}/*`}, (tabs) => {
        tabs.forEach(tab => {
            chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => { window.stop(); document.body.innerHTML = "<h1>Blocked by Teacher</h1>"; }
            });
        });
    });
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "REMOTE_BLOCK") {
        nukeSite(msg.domain).then(() => sendResponse({ success: true }));
        return true;
    }
});
