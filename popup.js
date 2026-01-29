document.getElementById('generate-btn').addEventListener('click', async () => {
  const promptInput = document.getElementById('image-prompt');
  const resultImg = document.getElementById('result-image');
  const loading = document.getElementById('loading');

  const prompt = promptInput.value.trim();
  if (!prompt) {
    alert("Будь ласка, введіть опис для зображення.");
    return;
  }

  // 1. Початок завантаження
  loading.style.display = 'block';
  if (resultImg.src) URL.revokeObjectURL(resultImg.src); // Очищення пам'яті від попереднього фото
  resultImg.style.display = 'none';

  try {
    // 2. Запит до Worker
    const response = await fetch("https://still-morning-2049.shyulia17.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "generate_image",
        text: prompt // Використовуємо 'text', бо так прописано у вашому Worker
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.result || "Сервер не зміг згенерувати зображення.");
    }

    // 3. Обробка бінарних даних
    const blob = await response.blob();
    if (blob.size === 0) throw new Error("Отримано порожнє зображення.");

    // 4. Створення та показ картинки
    const imgUrl = URL.createObjectURL(blob);
    resultImg.src = imgUrl;
    resultImg.onload = () => {
        loading.style.display = 'none';
        resultImg.style.display = 'block';
    };

  } catch (error) {
    console.error("Помилка генерації:", error);
    alert("⚠️ " + error.message);
    loading.style.display = 'none';
  }
});

// Відкриття Side Panel
document.getElementById("open-sidepanel-btn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (tab) {
    chrome.sidePanel.open({ windowId: tab.windowId }).catch((err) => {
        console.error("Не вдалося відкрити панель:", err);
    });
  }
};