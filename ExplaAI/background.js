// 1. Початкове налаштування при встановленні
chrome.runtime.onInstalled.addListener(() => {
  // Налаштування поведінки панелі (відкриття при кліку на іконку)
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("SidePanel Error:", err));

  // Створення контекстного меню
  chrome.contextMenus.create({
    id: "explainText",
    title: "Пояснити за допомогою ExplaAI",
    contexts: ["selection"]
  });

  // Початкові налаштування
  chrome.storage.local.set({
    theme: 'light',
    aiLevel: 'student'
  });
});

// 2. Обробка натискання на контекстне меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explainText") {
    // Відкриваємо панель для конкретного вікна
    chrome.sidePanel.open({ windowId: tab.windowId });

    // Зберігаємо вибраний текст
    const data = {
      selectedText: info.selectionText,
      timestamp: Date.now()
    };

    chrome.storage.local.set(data, () => {
      // Надсилаємо повідомлення (буде отримано, якщо панель вже відкрита)
      chrome.runtime.sendMessage({
        type: "NEW_TEXT_SELECTED",
        data: info.selectionText
      }).catch(err => {
        // Помилка "Could not establish connection" нормальна, якщо панель ще закрита
        console.log("Панель ще не готова прийняти повідомлення.");
      });
    });
  }
});