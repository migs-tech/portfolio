import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';

// Copies text to the clipboard and confirms for two seconds.
// Not rendered where the Clipboard API is unavailable (non-secure origins).
export function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!navigator.clipboard) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button type="button" className={`copy-btn${copied ? ' is-copied' : ''}`} onClick={copy}>
      <Icon name={copied ? 'check' : 'copy'} size={15} />
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      <span className="visually-hidden"> {label}</span>
    </button>
  );
}
