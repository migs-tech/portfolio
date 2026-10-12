import { useEffect, useState } from 'react';
import { fetchVisitors } from '../../lib/visits';
import { CountUp } from './CountUp';
import { Icon } from './Icon';

const withCommas = (n) => Math.round(n).toLocaleString('en-US');

// "1,234 visitors so far" in the footer. Only the total is ever shown; nothing
// about who visited is stored (see api/visits.js). Hidden until the counter
// answers, and stays hidden if it can't.
export function VisitorCount() {
  const [visitors, setVisitors] = useState(null);

  useEffect(() => {
    let active = true;
    fetchVisitors().then((total) => {
      if (active && total !== null) setVisitors(total);
    });
    return () => {
      active = false;
    };
  }, []);

  if (visitors === null) return null;

  return (
    <p className="visit-count" title="Counted anonymously: no names, no tracking">
      <Icon name="eye" size={15} />
      <span>
        <strong>
          <CountUp value={visitors} duration={1200} format={withCommas} />
        </strong>{' '}
        {visitors === 1 ? 'visitor' : 'visitors'} so far
      </span>
      <span className="visit-note">counted anonymously</span>
    </p>
  );
}
