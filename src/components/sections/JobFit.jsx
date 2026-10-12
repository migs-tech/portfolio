import { useEffect, useRef, useState } from 'react';
import { samplePosts } from '../../content/jobFit';
import { composeMessage } from '../../lib/contact';
import { analyzeJob, fitMessage, fitSummary } from '../../lib/jobFit';
import { CountUp } from '../ui/CountUp';
import { Icon } from '../ui/Icon';
import { Reveal, Section } from '../ui/Section';

const MIN_LENGTH = 20;

// "Hiring? See how I fit your role." A visitor pastes a job post; the skills it
// asks for light up, with a fit score and where I used each one. The matching
// (lib/jobFit.js) runs in the browser, so nothing pasted leaves the page.
export function JobFit() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [run, setRun] = useState(0); // replays the result animations on every check
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(true);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const check = (post = text) => {
    if (post.trim().length < MIN_LENGTH) {
      setError('Paste a job post first, or try one of the samples.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setResult(analyzeJob(post));
    setRun((n) => n + 1);
    setEditing(false);
    // On narrow screens the result sits below the post; bring it into view.
    if (window.matchMedia('(max-width: 900px)').matches) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  };

  const trySample = (sample) => {
    setText(sample.text);
    check(sample.text);
  };

  const edit = () => {
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(fitSummary(result, `${window.location.origin}/`));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const sendRole = () => {
    composeMessage(fitMessage(result));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('contact-name')?.focus({ preventScroll: true }), 600);
  };

  const recognized = result ? result.matched.length + result.missing.length : 0;

  return (
    <Section
      id="fit"
      index="05"
      label="Fit check"
      title="Hiring? See how I fit your role."
      intro="Paste a job post and the skills it asks for light up, with where I’ve used each one. It runs in your browser: nothing you paste is sent or saved."
    >
      <div className="fit">
        <Reveal className="fit-panel fit-input">
          {editing || !result ? (
            <>
              <div className="field">
                <label htmlFor="fit-post">Job post</label>
                <textarea
                  ref={inputRef}
                  id="fit-post"
                  rows="11"
                  value={text}
                  placeholder="Paste the job title, duties and requirements here…"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? 'fit-post-error' : 'fit-post-hint'}
                  onChange={(event) => {
                    setText(event.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                      event.preventDefault();
                      check();
                    }
                  }}
                />
                {error ? (
                  <p id="fit-post-error" className="field-error">
                    <span aria-hidden="true">!</span> {error}
                  </p>
                ) : (
                  <p id="fit-post-hint" className="fit-hint">
                    Ctrl + Enter also checks it.
                  </p>
                )}
              </div>
              <div className="fit-samples">
                <span className="fit-samples-label">No post handy? Try:</span>
                {samplePosts.map((sample) => (
                  <button key={sample.label} type="button" className="fit-sample" onClick={() => trySample(sample)}>
                    {sample.label}
                  </button>
                ))}
              </div>
              <div className="fit-buttons">
                <button type="button" className="btn btn-primary" onClick={() => check()}>
                  <Icon name="search" />
                  <span>Check my fit</span>
                </button>
                {text && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setText('');
                      setResult(null);
                      inputRef.current?.focus();
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="fit-post-head">
                <p className="fit-post-title">{result.title ?? 'Job post'}</p>
                <button type="button" className="btn btn-secondary btn-sm" onClick={edit}>
                  Edit post
                </button>
              </div>
              <p className="fit-legend">
                <span className="fit-key is-yes">On my résumé</span>
                <span className="fit-key is-no">Not on it yet</span>
              </p>
              <div className="fit-post" key={run} tabIndex={0} aria-label="The job post, with skills highlighted">
                {result.segments.map((part, i) =>
                  part.label ? (
                    <mark key={i} className={part.has ? 'is-yes' : 'is-no'} title={part.label} style={{ '--i': Math.min(i, 40) }}>
                      {part.text}
                    </mark>
                  ) : (
                    <span key={i}>{part.text}</span>
                  ),
                )}
              </div>
            </>
          )}
        </Reveal>

        <Reveal className="fit-panel fit-result" style={{ '--i': 1 }}>
          <div ref={resultRef} className="fit-anchor" />
          <div aria-live="polite">
            {!result && (
              <div className="fit-empty">
                <span className="fit-ring is-empty" aria-hidden="true">
                  <svg viewBox="0 0 120 120">
                    <circle className="fit-ring-track" cx="60" cy="60" r="52" />
                  </svg>
                  <span className="fit-ring-label">?</span>
                </span>
                <p>Your result appears here: a fit score, the skills that match and where I used each one.</p>
              </div>
            )}

            {result && result.score === null && (
              <div className="fit-empty" key={run}>
                <p>
                  I couldn’t spot specific skills in that text. Paste the requirements part of the post, or try one of the
                  samples.
                </p>
              </div>
            )}

            {result && result.score !== null && (
              <div key={run} className={`fit-report fit-tone-${result.level.tone}`}>
                <div className="fit-score">
                  <span className="fit-ring" style={{ '--score': result.score }} aria-hidden="true">
                    <svg viewBox="0 0 120 120">
                      <circle className="fit-ring-track" cx="60" cy="60" r="52" />
                      <circle className="fit-ring-value" cx="60" cy="60" r="52" pathLength="100" />
                    </svg>
                    <span className="fit-ring-label">
                      <CountUp value={result.score} duration={1100} />
                      <small>%</small>
                    </span>
                  </span>
                  <div>
                    <p className="fit-level">{result.level.label}</p>
                    <p className="fit-summary">
                      <span className="visually-hidden">Fit score {result.score}%. </span>
                      {result.matched.length} of the {recognized} skills I recognized in this post {result.matched.length === 1 ? 'is' : 'are'} on
                      my résumé.
                    </p>
                  </div>
                </div>

                {result.matched.length > 0 && (
                  <>
                    <h3 className="fit-subhead">On my résumé</h3>
                    <ul className="fit-list" role="list">
                      {result.matched.map((skill, i) => (
                        <li key={skill.label} className="fit-row" style={{ '--i': i }}>
                          <Icon name="check" size={16} />
                          <span className="fit-what">
                            <span className="fit-skill">{skill.label}</span>
                            {skill.evidence.map((item) =>
                              item.href ? (
                                <a key={item.label} className="fit-evidence" href={item.href}>
                                  {item.label}
                                </a>
                              ) : (
                                <span key={item.label} className="fit-evidence">
                                  {item.label}
                                </span>
                              ),
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {result.missing.length > 0 && (
                  <>
                    <h3 className="fit-subhead">Not on my résumé yet</h3>
                    <ul className="fit-gaps" role="list">
                      {result.missing.map((skill, i) => (
                        <li key={skill.label} style={{ '--i': i + result.matched.length }}>
                          {skill.label}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <div className="fit-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={sendRole}>
                    <Icon name="mail" size={16} />
                    <span>Send this role to Felix</span>
                  </button>
                  {navigator.clipboard && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={copySummary}>
                      <Icon name={copied ? 'check' : 'copy'} size={16} />
                      <span>{copied ? 'Copied' : 'Copy summary'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
