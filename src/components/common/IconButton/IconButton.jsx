import './IconButton.css';

const IconButton = ({
  type = 'button',
  title,
  variant = 'default',
  children,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`icon-button icon-button-${variant}`}
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default IconButton;