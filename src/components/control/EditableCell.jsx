import { useEffect, useState } from 'react';

const EditableCell = ({ value, type = 'text', onChange, className = '' }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const commit = () => {
    setEditing(false);

    if (String(draft) !== String(value)) {
      onChange(draft);
    }
  };

  if (editing) {
    return (
      <input
        autoFocus
        className={`ctrl-inline-input ${className}`}
        type={type}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit();
          if (event.key === 'Escape') setEditing(false);
        }}
      />
    );
  }

  return (
    <span
      className={`ctrl-inline-text ${className}`}
      title="Clic para editar"
      onClick={() => setEditing(true)}
    >
      {draft || '-'}
    </span>
  );
};

export default EditableCell;
