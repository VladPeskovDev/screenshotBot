// renderer.js
window.addEventListener('DOMContentLoaded', () => {
  const chatIdInput = document.getElementById('chatIdInput');
  const promptInput = document.getElementById('promptInput');
  const screenshotPromptInput = document.getElementById('screenshotPrompt');
  const saveBtn = document.getElementById('saveBtn');
  const quitBtn = document.getElementById('quitBtn'); // Кнопка выхода

  // 🔹 Загружаем сохранённые значения
  window.electronAPI.loadSettings().then(({ chatId, prompt, screenshotPrompt }) => {
    chatIdInput.value = chatId;
    promptInput.value = prompt;
    screenshotPromptInput.value = screenshotPrompt;
  });

  // 🔹 При нажатии "Сохранить" обновляем JSON
  saveBtn.addEventListener('click', () => {
    window.electronAPI.saveSettings(
      chatIdInput.value.trim(),
      promptInput.value.trim(),
      screenshotPromptInput.value.trim()
    );
  });

  // 🔹 Выход из приложения
  quitBtn.addEventListener('click', () => {
    window.electronAPI.quitApp();
  });
});
