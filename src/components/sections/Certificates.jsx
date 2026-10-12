import { useCallback, useEffect, useRef, useState } from 'react';
import { certificates } from '../../content/profile';
import { Lightbox } from '../project/Lightbox';
import { Icon } from '../ui/Icon';
import { Reveal } from '../ui/Section';

const images = certificates.map((cert) => ({
  ...cert.image,
  kind: 'doc',
  alt: cert.alt,
  caption: `${cert.title} · ${cert.date} · Signatures blurred for privacy`,
}));

// Certificate cards in the Education column; each thumbnail opens a zoomable view.
// Other parts of the page open one with openCertificate(id) (lib/certificates.js).
// Rendered only when certificates exist.
export function Certificates() {
  const [openIndex, setOpenIndex] = useState(null);
  const triggerRefs = useRef([]);
  const returnFocus = useRef(null);

  useEffect(() => {
    const onOpen = (event) => {
      const index = certificates.findIndex((cert) => cert.id === event.detail);
      if (index === -1) return;
      returnFocus.current = document.activeElement;
      setOpenIndex(index);
    };
    window.addEventListener('portfolio:certificate', onOpen);
    return () => window.removeEventListener('portfolio:certificate', onOpen);
  }, []);

  // Back to whatever opened it: a thumbnail here, or a link elsewhere on the page.
  const close = useCallback(() => {
    const target = returnFocus.current ?? triggerRefs.current[openIndex];
    returnFocus.current = null;
    target?.focus?.();
    setOpenIndex(null);
  }, [openIndex]);

  const navigate = useCallback((step) => setOpenIndex((current) => (current + step + images.length) % images.length), []);

  if (!certificates.length) return null;

  return (
    <div className="certificates">
      <h3 className="subhead" id="certificates">
        <Icon name="award" size={18} />
        Certificates
      </h3>
      <ul className="cert-list" role="list">
        {certificates.map((cert, i) => (
          <Reveal as="li" key={cert.id} className="cert spotlight" data-pointer style={{ '--i': i + 1 }}>
            <button
              type="button"
              className="cert-thumb"
              ref={(el) => (triggerRefs.current[i] = el)}
              onClick={() => setOpenIndex(i)}
              data-cursor="Zoom"
            >
              <img
                src={cert.image.thumb}
                width={cert.image.width}
                height={cert.image.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
              <span className="visually-hidden">View {cert.kind.toLowerCase()}</span>
            </button>
            <div>
              <p className="cert-kind">{cert.kind}</p>
              <p className="cert-title">{cert.title}</p>
              <p className="cert-meta">{cert.issuer}</p>
              <p className="cert-meta">
                {cert.date}
                {cert.note && ` · ${cert.note}`}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
      <p className="cert-privacy">
        Signatures are blurred for privacy. The originals and my Transcript of Records are available on request.
      </p>
      <Lightbox images={images} index={openIndex} onClose={close} onNavigate={navigate} />
    </div>
  );
}
