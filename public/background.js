chrome.action.onClicked.addListener(async (tab) => {
    // Ouvre le side panel
    await chrome.sidePanel.open({ windowId: tab.windowId });

    // Optionnel : active aussi le side panel pour l'onglet courant
    await chrome.sidePanel.setOptions({
        enabled: true,
        path: "index.html",
    });
});