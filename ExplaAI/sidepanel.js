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

// 2. Функція виклику AI (День 3: Integration)
async function fetchAIExplanation(text) {
  if (!text) return;

  elements.result.innerHTML = '<span class="loading">Аналізую текст...</span>';

  try {
    // Тут буде ваш реальний API endpoint
    const response = await fetch("https://explaai-server.yourname.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text, level: "student" })
    });
    const data = await response.json();
    elements.result.innerText = data.result;
  } catch (error) {
    elements.result.innerText = "Помилка: не вдалося з'єднатися з AI.";
    console.error("AI Fetch Error:", error);
  }
}

// 3. Логіка Меню та Тем (День 4-5: UI/UX)
const toggleMenu = () => elements.dropdown.classList.toggle("hidden");

elements.menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  toggleMenu();
});

// Закриття меню при кліку поза ним
document.addEventListener("click", () => elements.dropdown.classList.add("hidden"));

// Перемикач теми
elements.themeBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-mode");
  chrome.storage.local.set({ theme: isDark ? 'dark' : 'light' });
});

// Закриття панелі
elements.closeBtn.addEventListener("click", () => window.close());

// 4. Синхронізація зі сховищем (State Management)
// Завантаження при відкритті
chrome.storage.local.get(["selectedText", "theme"], (data) => {
  if (data.theme === 'dark') document.body.classList.add("dark-mode");
  if (data.selectedText) fetchAIExplanation(data.selectedText);
});

// Реакція на нове виділення тексту (День 2: Scaffolding)
chrome.storage.onChanged.addListener((changes) => {
  if (changes.selectedText) {
    fetchAIExplanation(changes.selectedText.newValue);
  }
});