import type { ConversionResult } from '../types';

interface ResultCardProps {
  result: ConversionResult | null;
}

function ResultIcon(props: { type: 'clock' | 'move' | 'basket' }) {
  if (props.type === 'clock') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <circle cx="12" cy="12" fill="none" r="8" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M12 7.8V12l2.9 2"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  if (props.type === 'move') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M7.5 15.2c1.6 1.6 4.2 1.6 5.8 0l3.2-3.2M16.5 8.8c-1.6-1.6-4.2-1.6-5.8 0L7.5 12"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.8"
        />
        <path
          d="M14.7 6.8h2.8v2.8M9.3 17.2H6.5v-2.8"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M5.5 8.8h13M7 8.8l1.2 8.2h7.6L17 8.8M9 8.8V7.6a3 3 0 0 1 6 0v1.2"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function confidenceLabel(level: ConversionResult['confidence']['level']) {
  if (level === 'high') {
    return 'High confidence';
  }

  if (level === 'medium') {
    return 'Medium confidence';
  }

  return 'Low confidence';
}

export function ResultCard({ result }: ResultCardProps) {
  if (!result) {
    return (
      <section className="result-panel placeholder-panel">
        <p className="eyebrow">Result</p>
        <h2>Your starting point will appear here.</h2>
        <p className="placeholder-copy">
          Enter the oven instructions, choose a supported category, and the tool will return
          a practical air-fryer temperature, time range, method guidance, and confidence note.
        </p>
      </section>
    );
  }

  return (
    <section className="result-panel">
      <div className="result-header">
        <div>
          <p className="eyebrow">Suggested starting point</p>
          <h2>
            Air fry at {result.airFryerTemp}
            {'\u00b0'}C
          </h2>
        </div>
        <span className={`confidence-pill confidence-${result.confidence.level}`}>
          {confidenceLabel(result.confidence.level)}
        </span>
      </div>

      <p className="result-time">{result.timeRange.label}</p>
      <p className="supporting-copy">
        Adjusted from your oven instructions using the selected category, fryer class, and
        options.
      </p>

      <div className="fact-grid">
        <div className="fact-card">
          <span className="fact-icon">
            <ResultIcon type="clock" />
          </span>
          <span className="fact-label">Check at</span>
          <strong>{result.checkAt} minutes</strong>
        </div>
        <div className="fact-card">
          <span className="fact-icon">
            <ResultIcon type="move" />
          </span>
          <span className="fact-label">Halfway</span>
          <strong>{result.agitation}</strong>
        </div>
        <div className="fact-card">
          <span className="fact-icon">
            <ResultIcon type="basket" />
          </span>
          <span className="fact-label">Load guidance</span>
          <strong>{result.loadGuidance}</strong>
        </div>
      </div>

      {result.standTime ? <p className="stand-time">{result.standTime}</p> : null}

      <div className="confidence-block">
        <p className="confidence-heading">{confidenceLabel(result.confidence.level)}</p>
        <p>{result.confidence.reason}</p>
      </div>

      <div className="notes-block">
        <p className="notes-heading">Practical notes</p>
        <ul>
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
