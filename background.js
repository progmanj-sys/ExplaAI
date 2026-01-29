// 1. Ініціалізація при встановленні
chrome.runtime.onInstalled.addListener(() => {
  // Налаштування: відкривати панель при кліку на іконку розширення
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
    .catch((err) => console.error("SidePanel Error:", err));

  // Створюємо УНІКАЛЬНЕ контекстне меню
  chrome.contextMenus.create({
    id: "explain-text-action",
    title: "Пояснити за допомогою ExplaAI",
    contexts: ["selection"]
  });

  // Початкові налаштування сховища
  chrome.storage.local.set({
    theme: 'light',
    aiLevel: 'student'
  });
});

// 2. Обробка натискання на меню
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "explain-text-action") {
    const selectedText = info.selectionText;

    // Відкриваємо бічну панель
    chrome.sidePanel.open({ windowId: tab.windowId });

    // КРОК А: Зберігаємо текст у сховище (на випадок, якщо панель закрита)
    chrome.storage.local.set({ lastSelectedText: selectedText });

    // КРОК Б: Відправляємо повідомлення (на випадок, якщо панель ВЖЕ відкрита)
    // Додаємо невелику затримку, щоб SidePanel встигла ініціалізуватися
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: "TEXT_SELECTED",
        text: selectedText
      }).catch(() => {
        // Ігноруємо помилку, якщо ніхто не прослуховує (панель ще завантажується)
        console.log("Панель ініціалізується, текст взято зі сховища.");
      });
    }, 600);
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GENERATE_IMAGE") {
    // Викликаємо ваш Worker
    fetch("https://still-morning-2049.shyulia17.workers.dev", {
      method: "POST",
      body: JSON.stringify({
        action: "generate_image",
        prompt: message.prompt
      })
    })
    .then(res => res.json())
    .then(data => sendResponse({ imageUrl: data.url }))
    .catch(err => sendResponse({ error: err.message }));

    return true; // Важливо для асинхронних відповідей
  }
});