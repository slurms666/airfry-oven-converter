type TimerAlertType = 'action' | 'complete';

let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const AudioContextConstructor = window.AudioContext;
  if (!AudioContextConstructor) {
    return null;
  }

  if (!sharedAudioContext) {
    sharedAudioContext = new AudioContextConstructor();
  }

  return sharedAudioContext;
}

function scheduleTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  durationSeconds: number,
  gainAmount: number,
) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(gainAmount, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + durationSeconds + 0.02);
}

export async function primeTimerAudio(): Promise<boolean> {
  const context = getAudioContext();
  if (!context) {
    return false;
  }

  if (context.state === 'suspended') {
    await context.resume();
  }

  return context.state === 'running';
}

export function playTimerAlert(type: TimerAlertType): boolean {
  const context = getAudioContext();
  if (!context || context.state !== 'running') {
    return false;
  }

  const startTime = context.currentTime + 0.02;

  if (type === 'action') {
    scheduleTone(context, 880, startTime, 0.12, 0.028);
    scheduleTone(context, 698.46, startTime + 0.18, 0.12, 0.025);
    return true;
  }

  scheduleTone(context, 523.25, startTime, 0.16, 0.03);
  scheduleTone(context, 659.25, startTime + 0.2, 0.16, 0.034);
  scheduleTone(context, 880, startTime + 0.42, 0.28, 0.038);
  return true;
}
