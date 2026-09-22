// Web Audio API synthesizer for realistic mechanical keyboard switch sound tests

// clicky ไม่มีค่าตรงนี้ชั่วคราว: public/clicky_sound.mp3 จริง ๆ เป็นไฟล์วิดีโอ (MP4/H.264)
// ที่ถูกตั้งชื่อ .mp3 ไว้ผิด ไม่ใช่ไฟล์เสียงคลิกสวิตช์ เล่นผ่าน <audio> ไม่ได้
// เลยปล่อยให้ตกไปใช้ playSynthetic() แทนจนกว่าจะได้ไฟล์เสียงคลิกจริงมาแทนที่
const SWITCH_SOUNDS = {
    linear: '/linear_sound.mp3',
    tactile: '/tactile_sound.mp3',
};

// เสียงสังเคราะห์สั้นมาก (~0.1s) ใช้ตัวเลขนี้นับว่าเล่นจบเพื่อรีเซ็ตปุ่ม
const SYNTHETIC_DURATION_MS = 150;

// ไฟล์เสียงจริง (mp3) บางไฟล์ยาวเกินไป (8-12s) ตัดจบให้ไม่เกินเวลานี้ (ต่อ type)
const MAX_PLAYBACK_MS = {
    linear: 1000,
    tactile: 1000,
    clicky: 2000,
};
const DEFAULT_MAX_PLAYBACK_MS = 1000;

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.currentAudio = null;
        this.currentType = null;
        this.syntheticTimer = null;
        this.maxDurationTimer = null;
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

    // หยุดเสียงที่กำลังเล่นอยู่ ใช้ตอนกดปุ่มลำโพงซ้ำเพื่อปิดเสียง
    stop() {
        if (this.currentAudio) {
            this.currentAudio.onended = null;
            this.currentAudio.onerror = null;
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        if (this.syntheticTimer) {
            clearTimeout(this.syntheticTimer);
            this.syntheticTimer = null;
        }
        if (this.maxDurationTimer) {
            clearTimeout(this.maxDurationTimer);
            this.maxDurationTimer = null;
        }
        this.currentType = null;
    }

    // เล่นอยู่หรือเปล่า ถ้าใส่ type มาด้วยจะเช็กเฉพาะเสียงนั้น
    isPlaying(type) {
        return type === undefined ? this.currentType !== null : this.currentType === type;
    }

    // Play a click/thock sound based on switch profile
    // onEnded ถูกเรียกเมื่อเสียงเล่นจบเอง (ไม่เรียกถ้าโดน stop())
    playSwitchSound(type = 'linear', onEnded) {
        this.stop();
        this.currentType = type;

        const finish = () => {
            if (this.currentType !== type) return; // โดนหยุดหรือเปลี่ยนเสียงไปแล้ว
            if (this.maxDurationTimer) {
                clearTimeout(this.maxDurationTimer);
                this.maxDurationTimer = null;
            }
            this.currentAudio = null;
            this.currentType = null;
            if (onEnded) onEnded(type);
        };

        const audioSource = SWITCH_SOUNDS[type];

        try {
            // First, attempt to play a real audio recording if it exists in the public directory
            if (audioSource) {
                const audio = new Audio(audioSource);
                this.currentAudio = audio;
                audio.volume = 0.5;
                audio.onended = finish;

                let fallbackTriggered = false;
                const triggerFallback = () => {
                    if (fallbackTriggered) return;
                    fallbackTriggered = true;
                    if (this.currentType !== type) return; // ผู้ใช้กดหยุดไปก่อนแล้ว
                    this.currentAudio = null;
                    this.playSynthetic(type, finish);
                };

                audio.onerror = triggerFallback;
                const playPromise = audio.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            if (this.currentType !== type) return; // โดนหยุด/เปลี่ยนเสียงไปแล้วระหว่างรอ play()
                            // ตัดจบเสียงตามเวลาสูงสุดของแต่ละ type แม้ไฟล์ต้นฉบับจะยาวกว่านั้น
                            this.maxDurationTimer = setTimeout(() => {
                                this.maxDurationTimer = null;
                                if (this.currentAudio === audio) {
                                    audio.onended = null;
                                    audio.onerror = null;
                                    audio.pause();
                                    audio.currentTime = 0;
                                }
                                finish();
                            }, MAX_PLAYBACK_MS[type] ?? DEFAULT_MAX_PLAYBACK_MS);
                        })
                        .catch(triggerFallback);
                }
            } else {
                this.playSynthetic(type, finish);
            }
        } catch {
            this.playSynthetic(type, finish);
        }
    }

    playSynthetic(type, onEnded) {
        // เสียงสังเคราะห์สั้นมากและไม่มี event 'ended' จับเวลาให้ปุ่มกลับสถานะเอง
        if (onEnded) {
            this.syntheticTimer = setTimeout(() => {
                this.syntheticTimer = null;
                onEnded();
            }, SYNTHETIC_DURATION_MS);
        }

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
