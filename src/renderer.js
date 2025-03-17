let mediaRecorder;
let audioChunks = [];

window.electronAPI.startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.start();
    console.log('🎙 Запись началась...');
  } catch (error) {
    console.error('❌ Ошибка при доступе к микрофону:', error);
  }
};

window.electronAPI.stopRecording = async () => {
  if (!mediaRecorder) return console.error('❌ Ошибка: запись не начата.');

  mediaRecorder.onstop = async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('✅ Аудио записано. Отправляем на сервер...');
    await window.electronAPI.sendAudioToServer(buffer);

    // Очищаем буфер
    audioChunks = [];
  };

  mediaRecorder.stop();
  console.log('🛑 Запись остановлена...');
};
