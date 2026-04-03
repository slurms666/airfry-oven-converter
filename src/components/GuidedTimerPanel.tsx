import type { GuidedTimerPlan } from '../utils/guidedTimer';
import { useGuidedTimer } from '../hooks/useGuidedTimer';

interface GuidedTimerPanelProps {
  plan: GuidedTimerPlan | null;
}

function statusLabel(
  status: 'complete' | 'idle' | 'running',
  actionPrompt: string,
  activeAlertType: 'action' | 'complete' | null,
): string {
  if (activeAlertType === 'action') {
    return actionPrompt;
  }

  if (status === 'complete') {
    return 'Ready to check';
  }

  if (status === 'running') {
    return 'Cooking';
  }

  return 'Ready to start';
}

export function GuidedTimerPanel({ plan }: GuidedTimerPanelProps) {
  const {
    activeAlert,
    audioReady,
    dismissAlert,
    isRunning,
    nextReminder,
    remainingLabel,
    restart,
    start,
    status,
    stop,
    totalLabel,
  } = useGuidedTimer(plan);

  if (!plan) {
    return (
      <section className="timer-panel timer-panel-unavailable">
        <p className="notes-heading">Guided cooking timer</p>
        <p className="supporting-copy">
          A guided timer could not be prepared from this cook time, but you can still use the
          result above as your starting point.
        </p>
      </section>
    );
  }

  return (
    <section className="timer-panel">
      <div className="timer-header">
        <div>
          <p className="notes-heading">Guided cooking timer</p>
          <h3>Run the cook with simple timed prompts.</h3>
        </div>
        <span
          className={`timer-status timer-status-${activeAlert?.type ?? status}`}
        >
          {statusLabel(status, plan.actionPrompt, activeAlert?.type ?? null)}
        </span>
      </div>

      <div className="timer-metrics">
        <div className="timer-metric-card">
          <span className="timer-metric-label">Time remaining</span>
          <strong>{remainingLabel}</strong>
        </div>
        <div className="timer-metric-card">
          <span className="timer-metric-label">Total cook time</span>
          <strong>{totalLabel}</strong>
        </div>
      </div>

      {plan.reminders.length > 0 ? (
        <div className="timer-schedule-block">
          <div className="timer-upcoming-row">
            <span className="timer-metric-label">{plan.nextActionLabel}</span>
            <strong>{nextReminder ? nextReminder.label : 'No more prompts'}</strong>
          </div>

          <div className="timer-chip-row" role="list" aria-label={plan.scheduleLabel}>
            {plan.reminders.map((reminder) => (
              <span
                key={reminder.id}
                className={`timer-chip ${nextReminder?.id === reminder.id ? 'timer-chip-upcoming' : ''}`}
                role="listitem"
              >
                {reminder.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="timer-muted">
          No mid-cook action is set for this cook. You will still get a final alert when the
          timer ends.
        </p>
      )}

      {activeAlert ? (
        <div className={`timer-alert timer-alert-${activeAlert.type}`}>
          <div>
            <p className="timer-alert-title">{activeAlert.title}</p>
            <p>{activeAlert.detail}</p>
          </div>
          {activeAlert.type === 'action' ? (
            <button className="secondary-button" onClick={dismissAlert} type="button">
              Continue
            </button>
          ) : null}
        </div>
      ) : null}

      {!audioReady ? (
        <p className="timer-muted">
          Alert sounds may be blocked in this browser, so keep an eye on the on-screen prompts as
          well.
        </p>
      ) : null}

      <div className="timer-actions">
        {isRunning ? (
          <>
            <button className="secondary-button" onClick={restart} type="button">
              Restart timer
            </button>
            <button className="ghost-button" onClick={stop} type="button">
              Stop timer
            </button>
          </>
        ) : (
          <button className="primary-button" onClick={start} type="button">
            {status === 'complete' ? 'Start again' : 'Start guided timer'}
          </button>
        )}
      </div>
    </section>
  );
}
