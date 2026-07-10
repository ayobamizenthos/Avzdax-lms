let context: AudioContext | null = null;

function ensureContext() {
  if (typeof window === "undefined") return null;
  if (!context) {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    context = new Ctor();
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

export function primeAudio() {
  ensureContext();
}

export function playSuccess() {
  const ctx = ensureContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.5, now);
  master.connect(ctx.destination);

  const swoop = ctx.createOscillator();
  const swoopGain = ctx.createGain();
  swoop.type = "sine";
  swoop.frequency.setValueAtTime(520, now);
  swoop.frequency.exponentialRampToValueAtTime(1180, now + 0.13);
  swoopGain.gain.setValueAtTime(0.0001, now);
  swoopGain.gain.exponentialRampToValueAtTime(0.4, now + 0.02);
  swoopGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  swoop.connect(swoopGain);
  swoopGain.connect(master);
  swoop.start(now);
  swoop.stop(now + 0.24);

  const pop = ctx.createOscillator();
  const popGain = ctx.createGain();
  pop.type = "triangle";
  pop.frequency.setValueAtTime(1568, now + 0.12);
  popGain.gain.setValueAtTime(0.0001, now + 0.12);
  popGain.gain.exponentialRampToValueAtTime(0.28, now + 0.15);
  popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
  pop.connect(popGain);
  popGain.connect(master);
  pop.start(now + 0.12);
  pop.stop(now + 0.36);
}

export function playChime() {
  const ctx = ensureContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
  master.connect(ctx.destination);

  const notes = [783.99, 1046.5, 1318.51];
  notes.forEach((frequency, index) => {
    const start = now + index * 0.08;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.32, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + 0.65);
  });
}
