import { useState, useEffect, useCallback } from 'react';

const useSpeech = () => {
  const [voices, setVoices] = useState([]);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setSupported(true);
      
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = useCallback((text, options = {}) => {
    if (!supported) {
      console.error('Speech synthesis not supported');
      return;
    }

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (options.voice) utterance.voice = options.voice;
    if (options.rate) utterance.rate = options.rate;
    if (options.pitch) utterance.pitch = options.pitch;
    if (options.volume) utterance.volume = options.volume;

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  const pause = useCallback(() => {
    if (supported && speaking) {
      window.speechSynthesis.pause();
    }
  }, [supported, speaking]);

  const resume = useCallback(() => {
    if (supported) {
      window.speechSynthesis.resume();
    }
  }, [supported]);

  return {
    speak,
    stop,
    pause,
    resume,
    speaking,
    voices,
    supported
  };
};

export default useSpeech;