// Web Audio API synthesizer for realistic mechanical keyboard switch sound tests

class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a click/thock sound based on switch profile
  playSwitchSound(type: 'linear' | 'tactile' | 'clicky' = 'linear') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Noise buffer for mechanical bottom-out snap
      const bufferSize = this.ctx.sampleRate * 0.05; // 50ms noise burst
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      const noiseFilter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();

      if (type === 'linear') {
        // Deep thock sound (low frequency thud + subtle housing resonance)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.Q.setValueAtTime(3, now);
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else if (type === 'tactile') {
        // Crisp tactile bump & clack
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.07);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1400, now);
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      } else {
        // Clicky switch (bright high-pitch click leaf + snap)
        osc.type = 'square';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2400, now);
        filter.Q.setValueAtTime(4, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(3000, now);
        noiseGain.gain.setValueAtTime(0.35, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      }

      // Connect graph
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
      whiteNoise.start(now);
      whiteNoise.stop(now + 0.05);
    } catch {
      // AudioContext might be blocked until user gesture, graceful fallback
    }
  }
}

export const soundEngine = new SoundEngine();
