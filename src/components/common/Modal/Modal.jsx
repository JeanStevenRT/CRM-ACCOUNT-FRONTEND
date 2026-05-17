import './Modal.css';

const Modal = ({
  open,
  title,
  children,
  footer,
  onClose,
  size = 'md',
}) => {
  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal modal-${size}`}>
        <div className="modal-container">
            <div className="modal-header">
                <h2>{title}</h2>
                <button type="button" className="modal-close" onClick={onClose}> x </button>
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