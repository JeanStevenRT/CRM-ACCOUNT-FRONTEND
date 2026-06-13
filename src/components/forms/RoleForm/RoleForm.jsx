import { useState } from 'react';
import Button from '../../common/Button/Button';
import './RoleForm.css';

const RoleForm = ({
  initialValues = { nombre: '' },
  onSubmit,
  submitText = 'Guardar',
  loading = false,
}) => {
  const [nombre, setNombre] = useState(initialValues.nombre || '');

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit({
      nombre: nombre.trim().toLowerCase(),
    });
  };

  return (
    <form className="role-form" onSubmit={handleSubmit}>
      <label>
        Nombre del rol
        <input
          name="nombre"
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder="Ejemplo: admin"
          required
        />
      </label>

      <div className="role-form-actions">
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : submitText}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
