class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.voices = [];
    this.isSupported = 'speechSynthesis' in window;
  }

  async getVoices() {
    return new Promise((resolve) => {
      if (!this.isSupported) {
        resolve([]);
        return;
      }

      let voices = this.synth.getVoices();
      
      if (voices.length > 0) {
        this.voices = voices;
        resolve(voices);
      } else {
        this.synth.onvoiceschanged = () => {
          voices = this.synth.getVoices();
          this.voices = voices;
          resolve(voices);
        };
        
        // Timeout fallback
        setTimeout(() => {
          voices = this.synth.getVoices();
          this.voices = voices;
          resolve(voices);
        }, 100);
      }
    });
  }

  speak(text, options = {}) {
    return new Promise((resolve, reject) => {
      if (!this.isSupported) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.stop();
      
      this.utterance = new SpeechSynthesisUtterance(text);

      if (options.voice) this.utterance.voice = options.voice;
      if (options.rate) this.utterance.rate = options.rate;
      if (options.pitch) this.utterance.pitch = options.pitch;
      if (options.volume) this.utterance.volume = options.volume;

      this.utterance.onend = () => {
        resolve();
      };

      this.utterance.onerror = (event) => {
        reject(new Error(event.error));
      };

      // Start speaking
      this.synth.speak(this.utterance);
    });
  }

  pause() {
    if (this.isSupported && this.synth.speaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.isSupported && this.synth.paused) {
      this.synth.resume();
    }
  }

  stop() {
    if (this.isSupported) {
      this.synth.cancel();
    }
  }

  get isSpeaking() {
    return this.isSupported && this.synth.speaking;
  }

  get isPaused() {
    return this.isSupported && this.synth.paused;
  }
}

const voiceService = new VoiceService();

export default voiceService;