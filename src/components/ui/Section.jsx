import { useReveal } from '../../hooks/useReveal';
import { DecodeText } from './DecodeText';

// Standard page section: numbered label, heading, optional intro, then content.
// The label and heading decode into place when they first scroll into view.
export function Section({ id, index, label, title, intro, children, className = '' }) {
  const revealRef = useReveal();
  const headingId = `${id}-heading`;

  return (
    <section id={id} className={`section ${className}`} aria-labelledby={headingId}>
      <div className="container">
        <header className="section-head reveal" ref={revealRef}>
          <p className="eyebrow">
            <span className="eyebrow-index">{index}</span>
            <span aria-hidden="true" className="eyebrow-rule" />
            <DecodeText text={label} />
          </p>
          <h2 id={headingId} className="section-title">
            <DecodeText text={title} duration={800} />
          </h2>
          {intro && <p className="section-intro">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

export function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
