import { useEffect, useRef, useState } from 'react';
import { playTimerAlert, primeTimerAudio } from '../utils/timerAudio';
import { formatTimerClock, type GuidedTimerPlan } from '../utils/guidedTimer';

interface TimerAlert {
  type: 'action' | 'complete';
  title: string;
  detail: string;
}

function buildActionAlert(plan: GuidedTimerPlan, reminderLabel: string): TimerAlert {
  return {
    type: 'action',
    title: plan.actionPrompt,
    detail: `Reminder at ${reminderLabel}. ${plan.actionPrompt} and carry on cooking.`,
  };
}

function buildCompletionAlert(): TimerAlert {
  return {
    type: 'complete',
    title: 'Time to check',
    detail: 'The timer is up. Check the finish and make sure the food is ready before serving.',
  };
}

export function useGuidedTimer(plan: GuidedTimerPlan | null) {
  const intervalRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);
  const reminderIndexRef = useRef(0);
  const runIdRef = useRef(0);

  const [remainingSeconds, setRemainingSeconds] = useState(plan?.totalSeconds ?? 0);
  const [status, setStatus] = useState<'complete' | 'idle' | 'running'>('idle');
  const [activeAlert, setActiveAlert] = useState<TimerAlert | null>(null);
  const [audioReady, setAudioReady] = useState(true);

  function clearLoop() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function resetTimer(nextPlan: GuidedTimerPlan | null = plan) {
    clearLoop();
    runIdRef.current += 1;
    endTimeRef.current = null;
    reminderIndexRef.current = 0;
    setStatus('idle');
    setActiveAlert(null);
    setRemainingSeconds(nextPlan?.totalSeconds ?? 0);
  }

  useEffect(() => {
    resetTimer(plan);

    return () => {
      clearLoop();
    };
  }, [plan?.signature]);

  function tick(activePlan: GuidedTimerPlan) {
    if (endTimeRef.current === null) {
      return;
    }

    const remainingMs = Math.max(0, endTimeRef.current - Date.now());
    const nextRemainingSeconds = remainingMs / 1000;
    const elapsedSeconds = activePlan.totalSeconds - nextRemainingSeconds;
    setRemainingSeconds(nextRemainingSeconds);

    let nextReminderIndex = reminderIndexRef.current;
    while (
      nextReminderIndex < activePlan.reminders.length &&
      elapsedSeconds >= activePlan.reminders[nextReminderIndex].seconds
    ) {
      nextReminderIndex += 1;
    }

    if (nextReminderIndex > reminderIndexRef.current) {
      const reminder = activePlan.reminders[nextReminderIndex - 1];
      reminderIndexRef.current = nextReminderIndex;
      setActiveAlert(buildActionAlert(activePlan, reminder.label));
      playTimerAlert('action');
    }

    if (remainingMs <= 0) {
      clearLoop();
      reminderIndexRef.current = activePlan.reminders.length;
      setRemainingSeconds(0);
      setStatus('complete');
      setActiveAlert(buildCompletionAlert());
      playTimerAlert('complete');
    }
  }

  async function start() {
    if (!plan) {
      return;
    }

    clearLoop();
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    reminderIndexRef.current = 0;
    setActiveAlert(null);
    setStatus('running');
    setRemainingSeconds(plan.totalSeconds);
    endTimeRef.current = Date.now() + plan.totalSeconds * 1000;

    const audioAvailable = await primeTimerAudio().catch(() => false);
    if (runId !== runIdRef.current) {
      return;
    }

    setAudioReady(audioAvailable);
    intervalRef.current = window.setInterval(() => tick(plan), 250);
    tick(plan);
  }

  function stop() {
    resetTimer(plan);
  }

  function restart() {
    void start();
  }

  function dismissAlert() {
    if (activeAlert?.type === 'action') {
      setActiveAlert(null);
    }
  }

  const nextReminder =
    plan && reminderIndexRef.current < plan.reminders.length
      ? plan.reminders[reminderIndexRef.current]
      : null;

  return {
    activeAlert,
    audioReady,
    dismissAlert,
    isRunning: status === 'running',
    nextReminder,
    remainingLabel: formatTimerClock(Math.ceil(remainingSeconds)),
    restart,
    start,
    status,
    stop,
    totalLabel: plan ? formatTimerClock(plan.totalSeconds) : '0:00',
  };
}
