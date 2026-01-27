// 1. Ініціалізація елементів
const elements = {
  result: document.getElementById("result"),
  menuBtn: document.getElementById("menu-btn"),
  dropdown: document.getElementById("dropdown-menu"),
  themeBtn: document.getElementById("toggle-theme"),
  closeBtn: document.getElementById("close-panel"),
  form: document.getElementById("form"),
  input: document.getElementById("question")
};

// 2. Функція виклику Gemini AI через Cloudflare Worker
async function fetchAIExplanation(text, level = "student") {
  if (!text) return;

  // Візуальний зворотний зв'язок
  elements.result.innerHTML = '<span class="loading">Аналізую текст...</span>';

  try {
    const response = await fetch("https://still-morning-2049.shyulia17.workers.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text,
        level: level
      })
    });

    // Отримуємо відповідь як текст (це надійніше для дебагу)
    const responseText = await response.text();

    // Перевірка статусів (404, 500 тощо)
    if (!response.ok) {
      console.error("Помилка сервера:", responseText);
      throw new Error(`Сервер відповів помилкою ${response.status}`);
    }

    // Безпечний парсинг JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Некоректний JSON від сервера:", responseText);
      throw new Error("Сервер надіслав текст замість JSON.");
    }

    // Вивід результату
    if (data && data.result) {
      elements.result.innerText = data.result;
    } else {
      throw new Error(data.error || "Відповідь ШІ порожня або має невірний формат.");
    }

  } catch (error) {
    // Вивід помилки для користувача
    elements.result.innerText = `⚠️ ${error.message}`;
    console.error("AI Fetch Error:", error);
  }
}

// 3. Обробка форми
elements.form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = elements.input.value.trim();
  if (query) {
    await fetchAIExplanation(query);
    elements.input.value = "";
  }
});

// 4. Меню та Теми
const toggleMenu = () => elements.dropdown.classList.toggle("hidden");

elements.menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

document.addEventListener("click", (e) => {
  if (elements.dropdown && !elements.menuBtn.contains(e.target) && !elements.dropdown.contains(e.target)) {
    elements.dropdown.classList.add("hidden");
  }
});

elements.themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
});

elements.closeBtn.addEventListener("click", () => window.close());

// 5. Синхронізація та ініціалізація
chrome.storage.local.get(["selectedText", "theme"], (data) => {
  if (data.theme === 'dark') document.body.classList.add("dark-mode");
  if (data.selectedText) {
    fetchAIExplanation(data.selectedText);
    chrome.storage.local.remove("selectedText");
  }
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedText && changes.selectedText.newValue) {
    fetchAIExplanation(changes.selectedText.newValue);
  }
});