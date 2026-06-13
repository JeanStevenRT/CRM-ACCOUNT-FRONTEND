import { useEffect } from 'react';
import './Modal.css';

const Modal = ({
  open,
  title,
  children,
  footer,
  onClose,
  size = 'md',
}) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-container">
            <div className="modal-header">
                <h2 id="modal-title">{title}</h2>
                <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar"> x </button>
            </div>

            <div className="modal-body">
                {children}
            </div>

            {footer && (
                <div className="modal-footer">
                    {footer}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default Modal;
