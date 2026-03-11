/**
 * background.js - Billy Blocksi Enterprise Logic
 * This script handles real-time blocking commands.
 */

const BLOCKED_PAGE = chrome.runtime.getURL("blocked.html");

// 1. Initialization
chrome.runtime.onInstalled.addListener(() => {
    console.log("Billy Blocksi: System Initialized.");
    // Check if uBlock rulesets loaded correctly
    chrome.declarativeNetRequest.getEnabledRulesets((ids) => {
        console.log("Loaded Rulesets:", ids);
    });
});

/**
 * Core Function: NUKE_SITE
 * This mimics a remote teacher command to block a domain instantly.
 */
async function nukeSite(domain) {
    // Generate a unique ID for this dynamic rule (must be >= 1)
    const ruleId = Math.floor(Math.random() * 1000000) + 1;

    try {
        await chrome.declarativeNetRequest.updateDynamicRules({
            addRules: [{
                "id": ruleId,
                "priority": 10, // High priority to override static lists
                "action": { 
                    "type": "redirect", 
                    "redirect": { "url": BLOCKED_PAGE } 
                },
                "condition": { 
                    "urlFilter": `||${domain}^`, 
                    "resourceTypes": ["main_frame"] 
                }
            }]
        });

        // Professional Notification
        chrome.notifications.create({
            type: "basic",
            iconUrl: "icon.png", // Ensure you have an icon.png in your folder
            title: "Classroom Management",
            message: `Notice: Access to ${domain} has been restricted.`
        });
        
        console.log(`Billy: ${domain} added to dynamic blacklist (ID: ${ruleId})`);
    } catch (error) {
        console.error("Failed to update rules:", error);
    }
}

// 2. Listener for Commands (From Popup or eventually a Dashboard)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "REMOTE_BLOCK") {
        nukeSite(request.domain);
        sendResponse({ success: true });
    }
    return true; // Keeps the message channel open for async
});
