// 1. Поведінка Side Panel
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error("SidePanel Error:", err));

// 2. Встановлення розширення: меню + початкові налаштування
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "explainText",
    title: "Пояснити за допомогою ExplaAI",
    contexts: ["selection"]
  });

  // Ініціалізуємо базові налаштування (День 5 плану)
  chrome.storage.local.set({
    theme: 'light',
    aiLevel: 'student'
  });
});

// 3. Обробка натискання
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText") {
    // Відкриваємо панель
    chrome.sidePanel.open({ windowId: tab.windowId });

    // Зберігаємо текст та надсилаємо повідомлення, якщо панель вже відкрита
    const data = { selectedText: info.selectionText, timestamp: Date.now() };

    chrome.storage.local.set(data, () => {
      // Повідомляємо SidePanel, що з'явився новий текст (опціонально для реактивності)
      chrome.runtime.sendMessage({ type: "NEW_TEXT_SELECTED", data: info.selectionText });
    });
  }
});