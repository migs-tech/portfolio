import { useCallback, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Lightbox } from './Lightbox';

// One large screenshot, then the other web screenshots in two columns and the
// phone screenshots in device frames. Each opens the lightbox, in the same order.
export function Gallery({ images, projectName }) {
  const [openIndex, setOpenIndex] = useState(null);
  const triggerRefs = useRef([]);
  const [primary, ...rest] = images.map((image, index) => ({ image, index }));
  const web = rest.filter(({ image }) => image.kind !== 'mobile');
  const phones = rest.filter(({ image }) => image.kind === 'mobile');

  // Called after the dialog has closed, so focus can return to the thumbnail.
  const close = useCallback(() => {
    if (openIndex !== null) triggerRefs.current[openIndex]?.focus();
    setOpenIndex(null);
  }, [openIndex]);

  const navigate = useCallback(
    (step) => setOpenIndex((current) => (current + step + images.length) % images.length),
    [images.length],
  );

  const renderTrigger = ({ image, index }, sizes, className = '') => (
    <button
      key={index}
      type="button"
      className={`shot is-${image.kind} ${className}`.trim()}
      ref={(el) => (triggerRefs.current[index] = el)}
      onClick={() => setOpenIndex(index)}
      data-cursor="Zoom"
    >
      <span className="shot-frame">
        {image.kind === 'web' && (
          <span className="shot-bar" aria-hidden="true">
            <span className="window-dots" />
          </span>
        )}
        <img
          src={image.thumb}
          srcSet={`${image.thumb} ${Math.round(image.width / 2)}w, ${image.src} ${image.width}w`}
          sizes={sizes}
          width={image.width}
          height={image.height}
          alt=""
          // The main screenshot is in view as soon as the case study opens.
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <span className="shot-zoom" aria-hidden="true">
          <Icon name="expand" size={15} />
        </span>
      </span>
      <span className="shot-caption" aria-hidden="true">
        {image.caption}
      </span>
      <span className="visually-hidden">
        Enlarge screenshot {index + 1} of {images.length}: {image.alt}
      </span>
    </button>
  );

  return (
    <div className="gallery" role="group" aria-label={`${projectName} screenshots`}>
      {renderTrigger(primary, '(max-width: 980px) 100vw, 900px', 'shot-primary')}
      {web.length > 0 && (
        <div className="shot-columns">{web.map((item) => renderTrigger(item, '(max-width: 640px) 100vw, 450px'))}</div>
      )}
      {phones.length > 0 && <div className="shot-phones">{phones.map((item) => renderTrigger(item, '190px'))}</div>}
      <Lightbox images={images} index={openIndex} onClose={close} onNavigate={navigate} />
    </div>
  );
}
