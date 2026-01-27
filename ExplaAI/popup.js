document.getElementById("open-sidepanel-btn").onclick = async () => {
  // Отримуємо поточне вікно
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (tab) {
    // Відкриваємо Side Panel програмно
    chrome.sidePanel.open({ windowId: tab.windowId });
  }
};