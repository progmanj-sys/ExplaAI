// 1. Ініціалізація елементів
const elements = {
  result: document.getElementById("result"),
  menuBtn: document.getElementById("menu-btn"),
  dropdown: document.getElementById("dropdown-menu"),
  themeBtn: document.getElementById("toggle-theme"),
  closeBtn: document.getElementById("close-panel"),
  form: document.getElementById("form"),
  input: document.getElementById("question"),
  micBtn: document.getElementById("mic-btn"),
  modeBtns: document.querySelectorAll('.mode-btn'),
  speakBtn: document.getElementById("speak-btn")
};

// --- НОВИЙ БЛОК ЛОГІКИ ДЛЯ ПЕРЕДАЧІ ТЕКСТУ ---

const initSelectionData = () => {
  // 1. Перевіряємо чергу в сховищі (якщо панель щойно відкрилася)
  chrome.storage.local.get(["lastSelectedText"], (result) => {
    if (result.lastSelectedText) {
      console.log("Отримано текст зі сховища:", result.lastSelectedText);
      handleNewText(result.lastSelectedText);
      chrome.storage.local.remove("lastSelectedText");
    }
  });
};

const handleNewText = (text) => {
  if (elements.input) {
    elements.input.value = text;
    fetchAIExplanation(text);
  }
};

// 2. Слухаємо повідомлення (якщо панель вже відкрита)
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "TEXT_SELECTED" || message.type === "NEW_TEXT_SELECTED") {
    console.log("Отримано повідомлення:", message.text);
    handleNewText(message.text || message.data);
  }
});

// Запускаємо перевірку сховища після завантаження DOM
document.addEventListener('DOMContentLoaded', initSelectionData);

// --- КІНЕЦЬ БЛОКУ ПЕРЕДАЧІ ТЕКСТУ ---

// 2. Глобальні змінні стану
let currentMode = 'student';
const synth = window.speechSynthesis;
let voices = [];

const loadVoices = () => {
  voices = synth.getVoices();
};
if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = loadVoices;
loadVoices();

// 3. Розпізнавання мови (STT)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.lang = 'uk-UA';

  recognition.onstart = () => {
    elements.micBtn.classList.add('recording');
    elements.result.innerText = "Слухаю вас...";
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    handleNewText(transcript);
  };

  recognition.onerror = (event) => {
    elements.micBtn.classList.remove('recording');
    const errorMessages = {
      'no-speech': "Я вас не почула.",
      'not-allowed': "Доступ до мікрофона заблоковано."
    };
    elements.result.innerText = errorMessages[event.error] || `Помилка: ${event.error}`;
  };

  recognition.onend = () => elements.micBtn.classList.remove('recording');
}

// 4. Логіка озвучення (TTS)
function speak(text) {
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const isUkrainian = /[ііїєґІЇЄҐ]/.test(text);
  utterance.lang = isUkrainian ? 'uk-UA' : 'en-US';

  const allVoices = synth.getVoices();

  // Пріоритет 1: Хмарний голос Google (не залежить від ОС)
  // Пріоритет 2: Будь-який український
  // Пріоритет 3: Англійський (краще англ. акцент, ніж російський)
  let voice = allVoices.find(v => v.name.includes('Google') && v.lang.startsWith('uk')) ||
              allVoices.find(v => v.lang.startsWith('uk')) ||
              allVoices.find(v => v.lang.startsWith('en'));

  if (voice) {
    utterance.voice = voice;
    console.log("Обрано голос:", voice.name);
  }

  synth.speak(utterance);
}
// 5. Запит до AI
async function fetchAIExplanation(text) {
  const query = text.trim();
  if (query.length < 2) return;

  elements.result.innerHTML = '<span class="loading">Аналізую...</span>';
  elements.speakBtn.style.display = "none";

  try {
    const response = await fetch("https://still-morning-2049.shyulia17.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: query, level: currentMode })
    });

    const data = await response.json();
    if (data && data.result) {
      elements.result.innerText = data.result;
      elements.speakBtn.style.display = "flex";
      speak(data.result);
    }
  } catch (error) {
    elements.result.innerText = "⚠️ Помилка зв'язку з AI.";
  }
}

// 6. Обробка подій
elements.micBtn.addEventListener('click', () => {
  if (!recognition) return alert("STT не підтримується");
  try { recognition.start(); } catch (e) { recognition.stop(); }
});

elements.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = elements.input.value.trim();
  if (val) {
    fetchAIExplanation(val);
    elements.input.value = "";
  }
});

elements.modeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    elements.modeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentMode = btn.dataset.mode;
    elements.dropdown.classList.add("hidden");
  });
});

elements.menuBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  elements.dropdown.classList.toggle("hidden");
});

elements.themeBtn.addEventListener("click", () => document.body.classList.toggle("dark-mode"));
elements.closeBtn.addEventListener("click", () => window.close());

elements.speakBtn.addEventListener('click', () => {
  if (synth.speaking) synth.cancel();
  else speak(elements.result.innerText);
});