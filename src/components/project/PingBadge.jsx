import { useCallback, useEffect, useRef, useState } from 'react';
import { ping } from '../../lib/ping';

// "Live" badge that really checks: once it scrolls into view it pings the site
// from the visitor's browser and shows the response time. Click to ping again.
export function PingBadge({ url, label = 'Live', siteName }) {
  const ref = useRef(null);
  const [result, setResult] = useState({ state: 'idle', ms: null });

  const check = useCallback(async () => {
    setResult({ state: 'checking', ms: null });
    const { up, ms } = await ping(url);
    setResult({ state: up ? 'up' : 'down', ms });
  }, [url]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        check();
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [check]);

  const text = {
    idle: label,
    checking: 'Pinging…',
    up: `${label} · ${result.ms} ms`,
    down: 'No response',
  }[result.state];

  return (
    <button
      ref={ref}
      type="button"
      className={`status-badge ping-badge is-${result.state}`}
      onClick={check}
      title="Response time measured from your browser. Click to check again."
    >
      <span className="status-dot" aria-hidden="true" />
      {text}
      <span className="visually-hidden">. Check {siteName} again</span>
    </button>
  );
}
