export function createSpeechRecognizer({ onStart, onResult, onEnd, onError }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onstart = () => onStart?.();
  recognition.onresult = (event) => {
    let finalTranscript = "";
    let interimTranscript = "";

    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const text = event.results[index][0]?.transcript || "";
      if (event.results[index].isFinal) {
        finalTranscript += text;
      } else {
        interimTranscript += text;
      }
    }

    onResult?.({
      finalTranscript: finalTranscript.trim(),
      interimTranscript: interimTranscript.trim(),
    });
  };
  recognition.onerror = (event) => onError?.(event.error || "Speech recognition error");
  recognition.onend = () => onEnd?.();

  return recognition;
}

export function speakText(text, options = {}) {
  if (!("speechSynthesis" in window) || !text) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onend = () => options.onEnd?.();
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
}
