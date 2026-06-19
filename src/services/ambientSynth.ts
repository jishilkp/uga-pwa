class AmbientSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private chimeTimer: number | null = null;
  private tanpuraTimer: number | null = null;
  private delayNode: DelayNode | null = null;
  private feedbackNode: GainNode | null = null;
  private masterGain: GainNode | null = null;

  constructor() {}

  public start() {
    if (this.isPlaying && this.ctx && this.ctx.state !== 'closed') {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      
      this.ctx = new AudioContextClass();
      this.isPlaying = true;
      
      // Setup simple feedback delay/echo effect for spacious ambient sound
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.8;
      
      this.feedbackNode = this.ctx.createGain();
      this.feedbackNode.gain.value = 0.35;
      
      // Connect delay loop
      this.delayNode.connect(this.feedbackNode);
      this.feedbackNode.connect(this.delayNode);
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.08; // soft, subtle volume
      
      this.delayNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
      
      // 1. MEDITATIVE DEVOTIONAL TANPURA DRONE
      // Slow, cyclic plucking of 4 strings (Pa - Sa - Sa - Sa-low)
      // Detuned harmonic waves simulate the buzzing "jawari" bridge of a real Tanpura
      const tanpuraScale = [98.00, 130.81, 130.81, 65.41]; // G2, C3, C3, C2
      let currentString = 0;

      const pluckTanpura = (freq: number) => {
        if (!this.ctx || !this.isPlaying || this.ctx.state === 'closed') return;
        
        const now = this.ctx.currentTime;
        
        // Main warm body string (Triangle wave)
        const osc1 = this.ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.value = freq;
        
        // Metallic overtone buzz (Sawtooth wave with high filter decay)
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.value = freq * 2; // first octave harmonic
        
        // Subtle resonance filter
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.Q.value = 4.0;
        
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.015, now + 0.4); // slow pluck attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 6.5); // long resonance decay
        
        const buzzGain = this.ctx.createGain();
        buzzGain.gain.setValueAtTime(0.004, now);
        buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5); // buzz decays faster
        
        osc1.connect(filter);
        osc2.connect(buzzGain);
        buzzGain.connect(filter);
        filter.connect(gainNode);
        
        if (this.masterGain) gainNode.connect(this.masterGain);
        
        osc1.start(now);
        osc1.stop(now + 7.0);
        osc2.start(now);
        osc2.stop(now + 7.0);
      };

      const scheduleTanpura = () => {
        if (!this.isPlaying) return;
        pluckTanpura(tanpuraScale[currentString]);
        currentString = (currentString + 1) % 4;
        this.tanpuraTimer = window.setTimeout(scheduleTanpura, 1800); // Pluck next string every 1.8s
      };

      // 2. DEVOTIONAL BANSURI FLUTE / SANTOOR CHIMES
      // Plays notes from the beautiful, emotional Raga Shivaranjani in C
      // (C4, D4, Eb4, G4, A4, C5, D5, Eb5, G5, A5)
      const shivaranjaniScale = [261.63, 293.66, 311.13, 392.00, 440.00, 523.25, 587.33, 622.25, 783.99, 880.00];

      const playChime = () => {
        if (!this.ctx || !this.isPlaying || this.ctx.state === 'closed') return;
        
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        
        osc.type = 'sine'; // Pure whistle flute tone
        const freq = shivaranjaniScale[Math.floor(Math.random() * shivaranjaniScale.length)];
        osc.frequency.value = freq;
        
        // Add subtle human vocal vibrato (pitch-bend LFO) for devotional depth
        const vibrato = this.ctx.createOscillator();
        const vibratoGain = this.ctx.createGain();
        vibrato.frequency.value = 5.2; // 5.2 Hz soft wavering
        vibratoGain.gain.value = freq * 0.008; // extremely subtle pitch variation
        
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        const now = this.ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.045, now + 1.2); // soft swelling attack
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 5.5); // long echoing tail
        
        osc.connect(gainNode);
        if (this.masterGain) gainNode.connect(this.masterGain);
        if (this.delayNode) gainNode.connect(this.delayNode);
        
        vibrato.start(now);
        osc.start(now);
        
        osc.stop(now + 6.0);
        vibrato.stop(now + 6.0);
      };
      
      const scheduleChimes = () => {
        if (!this.isPlaying) return;
        playChime();
        const nextDelay = 3500 + Math.random() * 3500; // play every 3.5 to 7 seconds
        this.chimeTimer = window.setTimeout(scheduleChimes, nextDelay);
      };
      
      // Start both threads
      scheduleTanpura();
      scheduleChimes();
      
    } catch (e) {
      console.warn('Web Audio API not supported or failed to initialize:', e);
    }
  }
  
  public stop() {
    this.isPlaying = false;
    
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }
    if (this.tanpuraTimer) {
      clearTimeout(this.tanpuraTimer);
      this.tanpuraTimer = null;
    }
    
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch (e) {
        // Ignore
      }
      this.ctx = null;
    }
  }
}

export const ambientSynth = new AmbientSynth();
