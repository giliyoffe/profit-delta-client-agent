export function createSpeechRecognizer({ onStart, onResult, onEnd, onError }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onstart = () => onStart?.();
  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0]?.transcript || "")
      .join(" ")
      .trim();
    onResult?.(transcript);
  };
  recognition.onerror = (event) => onError?.(event.error || "Speech recognition error");
  recognition.onend = () => onEnd?.();

  return recognition;
}

export function speakText(text) {
  if (!("speechSynthesis" in window) || !text) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
