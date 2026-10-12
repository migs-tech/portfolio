import { CountUp } from '../ui/CountUp';
import { Reveal } from '../ui/Section';

// User evaluation: a headline rating, then one bar per quality characteristic.
// The rating counts up and the bars fill when the panel scrolls into view.
export function Results({ results }) {
  return (
    <section className="pd-section" aria-labelledby="pd-results">
      <h3 id="pd-results" className="pd-label">
        results
      </h3>
      <Reveal className="results">
        <div className="results-head">
          <p className="results-overall">
            <CountUp value={results.overall.toFixed(2)} />
            <span className="results-unit"> / 5</span>
          </p>
          <p className="results-rating">{results.rating}</p>
          <p className="results-note">
            {results.standard}. {results.note}
          </p>
        </div>
        <ul className="score-list" role="list">
          {results.scores.map((score, i) => (
            <li key={score.label}>
              <span className="score-label">{score.label}</span>
              <span className="score-bar" aria-hidden="true">
                <span style={{ '--value': score.value / 5, '--i': i }} />
              </span>
              <span className="score-value">{score.value.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
