import { useEffect, useRef } from 'react';
import { Icon } from '../ui/Icon';

// Full-screen image viewer built on <dialog>, which provides focus trapping,
// Escape-to-close and an inert background for free.
export function Lightbox({ images, index, onClose, onNavigate }) {
  const dialogRef = useRef(null);
  const open = index !== null;
  const image = open ? images[index] : null;
  // Always close through the dialog so its 'close' event is the single exit path.
  const requestClose = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === 'ArrowRight') onNavigate(1);
      if (event.key === 'ArrowLeft') onNavigate(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onNavigate]);

  return (
    <dialog
      ref={dialogRef}
      className="lightbox"
      aria-label="Screenshot viewer"
      onClose={onClose}
      onClick={(event) => event.target === dialogRef.current && requestClose()}
    >
      {image && (
        <div className="lightbox-body">
          <div className="lightbox-bar">
            <p className="lightbox-count" aria-live="polite">
              {index + 1} / {images.length}
            </p>
            <button type="button" className="icon-btn" onClick={requestClose} autoFocus>
              <Icon name="close" size={20} />
              <span className="visually-hidden">Close viewer</span>
            </button>
          </div>
          {/* Keyed by index so each screenshot gets its own entrance animation. */}
          <figure key={index} className={`lightbox-figure is-${image.kind}`}>
            <img src={image.src} alt={image.alt} width={image.width} height={image.height} />
            <figcaption>{image.caption}</figcaption>
          </figure>
          <div className="lightbox-nav">
            <button type="button" className="icon-btn" onClick={() => onNavigate(-1)}>
              <Icon name="chevronLeft" size={20} />
              <span className="visually-hidden">Previous screenshot</span>
            </button>
            <button type="button" className="icon-btn" onClick={() => onNavigate(1)}>
              <Icon name="chevronRight" size={20} />
              <span className="visually-hidden">Next screenshot</span>
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
