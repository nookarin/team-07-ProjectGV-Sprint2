// Web Audio API synthesizer for realistic mechanical keyboard switch sound tests

class SoundEngine {
    constructor() {
        this.ctx = null;
    }

    initCtx() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Play a click/thock sound based on switch profile
    playSwitchSound(type = 'linear') {
        try {
            // First, attempt to play a real audio recording if it exists in the public directory
            let audioSource = '';
            if (type === 'linear') {
                audioSource = '/linear_sound.mp3'; // The user can place their downloaded youtube audio here
            } else if (type === 'tactile') {
                audioSource = '/tactile_sound.mp3';
            } else if (type === 'clicky') {
                audioSource = '/clicky_sound.mp3';
            }

            if (audioSource) {
                const audio = new Audio(audioSource);
                audio.volume = 0.5;

                let fallbackTriggered = false;
                const triggerFallback = () => {
                    if (!fallbackTriggered) {
                        fallbackTriggered = true;
                        this.playSynthetic(type);
                    }
                };

                audio.onerror = triggerFallback;
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise.catch(triggerFallback);
                }
            } else {
                this.playSynthetic(type);
            }
        } catch {
            this.playSynthetic(type);
        }
    }

    playSynthetic(type) {
        try {
            this.initCtx();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            const bufferSize = this.ctx.sampleRate * 0.05;
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
            // Error handling
        }
    }
}

export const soundEngine = new SoundEngine();
