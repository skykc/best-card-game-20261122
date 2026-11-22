// audio.js — tiny WebAudio bleeps, synthesized in code, no sound files.
//
// Clicks, plays, clash results and the win / loss flourishes. Everything
// is wrapped so the game still plays silently when audio is unavailable.

let ctx = null;

function audioContext() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, dur, type, when, vol) {
  const ac = audioContext();
  if (!ac) return;
  try {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol || 0.12, ac.currentTime + (when || 0));
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (when || 0) + dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(ac.currentTime + (when || 0));
    osc.stop(ac.currentTime + (when || 0) + dur);
  } catch {
    // Stay silent rather than break the game.
  }
}

export function sfx(name) {
  switch (name) {
    case 'click':
      tone(660, 0.06, 'triangle');
      break;
    case 'play':
      tone(440, 0.09, 'square');
      tone(660, 0.12, 'square', 0.08);
      break;
    case 'deal':
      tone(520, 0.07, 'triangle');
      tone(780, 0.09, 'triangle', 0.07);
      break;
    case 'clashWin':
      tone(523, 0.12, 'triangle');
      tone(784, 0.16, 'triangle', 0.1);
      break;
    case 'clashLose':
      tone(330, 0.14, 'sawtooth', 0, 0.07);
      tone(220, 0.2, 'sawtooth', 0.1, 0.07);
      break;
    case 'clashTie':
      tone(440, 0.1, 'triangle');
      break;
    case 'deny':
      tone(180, 0.12, 'sawtooth', 0, 0.07);
      break;
    case 'win':
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'triangle', i * 0.12));
      break;
    case 'lose':
      [392, 330, 262, 196].forEach((f, i) => tone(f, 0.2, 'sawtooth', i * 0.13, 0.06));
      break;
    case 'start':
      tone(392, 0.1, 'triangle');
      tone(523, 0.14, 'triangle', 0.09);
      break;
    default:
      break;
  }
}
