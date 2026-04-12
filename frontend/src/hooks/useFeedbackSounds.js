import { useRef } from "react";

function buildTone(context, { frequency, duration, gain, type, delay = 0 }) {
  const oscillator = context.createOscillator();
  const volume = context.createGain();
  const startAt = context.currentTime + delay;
  const endAt = startAt + duration;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);

  volume.gain.setValueAtTime(0.0001, startAt);
  volume.gain.exponentialRampToValueAtTime(gain, startAt + 0.02);
  volume.gain.exponentialRampToValueAtTime(0.0001, endAt);

  oscillator.connect(volume);
  volume.connect(context.destination);

  oscillator.start(startAt);
  oscillator.stop(endAt);
}

export function useFeedbackSounds() {
  const audioContextRef = useRef(null);

  function getContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;

    // Resume suspended audio context (common on user-gated sites)
    if (context.state === "suspended") {
      context.resume().catch((err) => {
        console.warn("Failed to resume audio context", err);
      });
    }

    return context;
  }

  function playCorrect() {
    const context = getContext();
    if (!context) {
      return;
    }

    buildTone(context, { frequency: 523.25, duration: 0.14, gain: 0.028, type: "sine" });
    buildTone(context, { frequency: 659.25, duration: 0.18, gain: 0.022, type: "sine", delay: 0.08 });
  }

  function playWrong() {
    const context = getContext();
    if (!context) {
      return;
    }

    buildTone(context, { frequency: 349.23, duration: 0.16, gain: 0.02, type: "triangle" });
    buildTone(context, { frequency: 293.66, duration: 0.2, gain: 0.018, type: "triangle", delay: 0.1 });
  }

  return { playCorrect, playWrong };
}
